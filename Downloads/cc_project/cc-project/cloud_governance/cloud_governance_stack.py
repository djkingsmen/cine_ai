from aws_cdk import (
    Stack,
    Duration,
    CfnOutput,
    aws_lambda as _lambda,
    aws_events as events,
    aws_events_targets as targets,
    aws_iam as iam,
    aws_sns as sns,
    aws_sns_subscriptions as subs,
    aws_cloudwatch as cloudwatch,
    aws_cloudwatch_actions as cw_actions,
    aws_s3 as s3,
    aws_cloudtrail as cloudtrail,
    RemovalPolicy,
)
from constructs import Construct


class CloudGovernanceStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # ------------------------------------------------------
        # SNS Topic for all Governance Alerts
        # ------------------------------------------------------
        topic = sns.Topic(
            self, "SecurityAlertTopic",
            topic_name="CloudGovernanceAlerts"
        )

        topic.add_subscription(subs.EmailSubscription("YOUR_EMAIL@example.com"))  # 👈 Replace this!

        # ------------------------------------------------------
        # IAM Role for Lambda Functions
        # ------------------------------------------------------
        lambda_role = iam.Role(
            self, "LambdaAutomationRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaBasicExecutionRole"),
                iam.ManagedPolicy.from_aws_managed_policy_name("AmazonEC2FullAccess"),
                iam.ManagedPolicy.from_aws_managed_policy_name("AmazonSNSFullAccess"),
                iam.ManagedPolicy.from_aws_managed_policy_name("CloudWatchFullAccess")
            ]
        )

        # ✅ Add explicit S3 permissions
        lambda_role.add_to_policy(iam.PolicyStatement(
            actions=[
                "s3:GetBucketAcl", "s3:GetBucketPolicy", "s3:GetBucketPolicyStatus",
                "s3:GetBucketPublicAccessBlock", "s3:GetBucketLocation",
                "s3:ListAllMyBuckets", "s3:ListBucket",
                "s3:PutPublicAccessBlock", "s3:PutBucketPublicAccessBlock",
                "s3:PutBucketPolicy", "s3:DeleteBucketPolicy"
            ],
            resources=["*"]
        ))

        # ------------------------------------------------------
        # Lambda 1: S3 Public Access Reverter (Working)
        # ------------------------------------------------------
        s3_lambda = _lambda.Function(
            self, "S3PublicAccessReverter",
            function_name="S3PublicAccessReverter",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="index.lambda_handler",
            role=lambda_role,
            code=_lambda.InlineCode(
                """
import boto3, json, os

s3 = boto3.client('s3')
sns = boto3.client('sns')

def lambda_handler(event, context):
    print("Event:", json.dumps(event))
    try:
        bucket = event.get('detail', {}).get('requestParameters', {}).get('bucketName')
        if not bucket:
            print("❌ No bucket name found.")
            return
        print(f"🪣 Bucket detected: {bucket}")

        try:
            status = s3.get_bucket_policy_status(Bucket=bucket)
            print("Before remediation:", status)
        except Exception as e:
            print("⚠️ Could not get policy status:", str(e))

        s3.put_public_access_block(
            Bucket=bucket,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': True,
                'IgnorePublicAcls': True,
                'BlockPublicPolicy': True,
                'RestrictPublicBuckets': True
            }
        )
        print("🔒 Applied Public Access Block successfully")

        try:
            s3.delete_bucket_policy(Bucket=bucket)
            print("🧹 Deleted bucket policy")
        except Exception as e:
            print("⚠️ Delete policy error:", str(e))

        sns.publish(
            TopicArn=os.environ['TOPIC_ARN'],
            Message=f"✅ S3 bucket '{bucket}' reverted to private successfully."
        )
    except Exception as e:
        print("❌ Error:", str(e))
        sns.publish(
            TopicArn=os.environ['TOPIC_ARN'],
            Message=f"❌ Error in S3 Lambda: {str(e)}"
        )
                """
            ),
            environment={"TOPIC_ARN": topic.topic_arn},
            timeout=Duration.seconds(60)
        )

        s3_event_rule = events.Rule(
            self, "S3EventRule",
            description="Detects S3 bucket policy or ACL changes",
            event_pattern=events.EventPattern(
                source=["aws.s3"],
                detail_type=["AWS API Call via CloudTrail"],
                detail={"eventName": ["PutBucketPolicy", "PutBucketAcl"]}
            )
        )
        s3_event_rule.add_target(targets.LambdaFunction(s3_lambda))

        # ------------------------------------------------------
        # Lambda 2: Security Group Cleaner (Fixed)
        # ------------------------------------------------------
        sg_lambda = _lambda.Function(
            self, "SecurityGroupCleaner",
            function_name="SecurityGroupCleaner",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="index.lambda_handler",
            role=lambda_role,
            code=_lambda.InlineCode(
                """
import boto3, json, os
ec2 = boto3.client('ec2')
sns = boto3.client('sns')

def lambda_handler(event, context):
    print("Event:", json.dumps(event))
    try:
        params = event.get('detail', {}).get('requestParameters', {})
        sg_id = params.get('groupId')

        # Some CloudTrail events have nested groupSet
        if not sg_id and 'groupSet' in params:
            items = params['groupSet'].get('items', [])
            if items and 'groupId' in items[0]:
                sg_id = items[0]['groupId']

        if not sg_id:
            print("❌ No valid Security Group ID found in event.")
            return

        response = ec2.describe_security_groups(GroupIds=[sg_id])
        for sg in response['SecurityGroups']:
            for perm in sg.get('IpPermissions', []):
                for ipr in perm.get('IpRanges', []):
                    if ipr.get('CidrIp') == '0.0.0.0/0':
                        ec2.revoke_security_group_ingress(GroupId=sg_id, IpPermissions=[perm])
                        msg = f"✅ Removed public inbound rule from {sg_id}"
                        print(msg)
                        sns.publish(TopicArn=os.environ['TOPIC_ARN'], Message=msg)
                        return
        print("No risky rules found.")
    except Exception as e:
        print("❌ Error:", str(e))
        sns.publish(TopicArn=os.environ['TOPIC_ARN'], Message=f"Error in SG Cleaner: {e}")
                """
            ),
            environment={"TOPIC_ARN": topic.topic_arn},
            timeout=Duration.seconds(60)
        )

        sg_event_rule = events.Rule(
            self, "SGEventRule",
            description="Detects Security Group ingress changes",
            event_pattern=events.EventPattern(
                source=["aws.ec2"],
                detail_type=["AWS API Call via CloudTrail"],
                detail={"eventName": ["AuthorizeSecurityGroupIngress"]}
            )
        )
        sg_event_rule.add_target(targets.LambdaFunction(sg_lambda))

        # ------------------------------------------------------
        # Lambda 3: Cost Governance (Fixed)
        # ------------------------------------------------------
        # Lambda Function
        auto_stop_lambda = _lambda.Function(
            self, "AutoStopEC2",
            function_name="AutoStopEC2",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="index.lambda_handler",
            role=lambda_role,
            code=_lambda.InlineCode("""
        import boto3, os, datetime

        ec2 = boto3.client('ec2')
        cloudwatch = boto3.client('cloudwatch')
        sns = boto3.client('sns')

        def lambda_handler(event, context):
            stopped = []
            try:
                response = ec2.describe_instances(Filters=[{'Name': 'instance-state-name', 'Values': ['running']}])
                for reservation in response['Reservations']:
                    for instance in reservation['Instances']:
                        end_time = datetime.datetime.utcnow()
                        start_time = end_time - datetime.timedelta(minutes=5)  # last 5 mins
                        metrics = cloudwatch.get_metric_statistics(
                            Namespace='AWS/EC2',
                            MetricName='CPUUtilization',
                            Dimensions=[{'Name': 'InstanceId', 'Value': instance['InstanceId']}],
                            StartTime=start_time,
                            EndTime=end_time,
                            Period=300,
                            Statistics=['Average']
                        )
                        datapoints = metrics.get('Datapoints', [])
                        if datapoints and datapoints[0]['Average'] < 2:
                            ec2.stop_instances(InstanceIds=[instance['InstanceId']])
                            stopped.append(instance['InstanceId'])
                if stopped:
                    sns.publish(
                        TopicArn=os.environ['TOPIC_ARN'],
                        Message=f"🛑 Stopped idle EC2 instances: {stopped}"
                    )
            except Exception as e:
                sns.publish(TopicArn=os.environ['TOPIC_ARN'], Message=f"❌ Error in AutoStopEC2 Lambda: {str(e)}")
        """),
            environment={"TOPIC_ARN": topic.topic_arn},
            timeout=Duration.seconds(60)
        )

        # EventBridge Rule: Set-Rate (every 5 minutes)
        auto_stop_rule = events.Rule(
            self, "AutoStopEC2Rule",
            schedule=events.Schedule.rate(Duration.minutes(5))
        )
        auto_stop_rule.add_target(targets.LambdaFunction(auto_stop_lambda))
        cost_spike_lambda = _lambda.Function(
            self, "CostSpikeAlert",
            function_name="CostSpikeAlert",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="index.lambda_handler",
            role=lambda_role,
            code=_lambda.InlineCode("""
        import boto3, os, json

        sns = boto3.client('sns')

        def lambda_handler(event, context):
            budget_name = event.get('budgetName', 'MonthlyBudget')
            current_cost = event.get('currentCost', 0)
            threshold = event.get('threshold', 50)
            
            msg = f"⚠️ Budget exceeded! {budget_name} - Current: ${current_cost}, Limit: ${threshold}"
            sns.publish(TopicArn=os.environ['TOPIC_ARN'], Message=msg)
        """),
            environment={"TOPIC_ARN": topic.topic_arn},
            timeout=Duration.seconds(60)
        )

        # EventBridge Rule: Triggered by Budget Threshold Breach
        budget_event_rule = events.Rule(
            self, "BudgetThresholdRule",
            event_pattern=events.EventPattern(
                source=["aws.budgets"],
                detail_type=["Budget Threshold Breached"]
            )
        )
        budget_event_rule.add_target(targets.LambdaFunction(cost_spike_lambda))
        # ======================================================
        # CLOUDTRAIL SETUP - Centralized Logging
        # ======================================================
        # S3 Bucket for CloudTrail logs
        cloudtrail_bucket = s3.Bucket(
            self, "CloudTrailBucket",
            bucket_name=f"cloudtrail-logs-{self.account}-{self.region}",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            encryption=s3.BucketEncryption.S3_MANAGED,
            versioned=True,
            removal_policy=RemovalPolicy.RETAIN
        )

        # Allow CloudTrail to write to S3
        cloudtrail_bucket.add_to_resource_policy(
            iam.PolicyStatement(
                sid="AWSCloudTrailAclCheck",
                principals=[iam.ServicePrincipal("cloudtrail.amazonaws.com")],
                actions=["s3:GetBucketAcl"],
                resources=[cloudtrail_bucket.bucket_arn]
            )
        )

        cloudtrail_bucket.add_to_resource_policy(
            iam.PolicyStatement(
                sid="AWSCloudTrailWrite",
                principals=[iam.ServicePrincipal("cloudtrail.amazonaws.com")],
                actions=["s3:PutObject"],
                resources=[f"{cloudtrail_bucket.bucket_arn}/*"],
                conditions={
                    "StringEquals": {
                        "s3:x-amz-acl": "bucket-owner-full-control"
                    }
                }
            )
        )

        # CloudTrail
        trail = cloudtrail.Trail(
            self, "CloudGovernanceTrail",
            bucket=cloudtrail_bucket,
            is_multi_region_trail=True,
            include_global_service_events=True,
            enable_file_validation=True
        )

        # Log all CloudTrail events
        trail.enable_log_file_validation()

        # ======================================================
        # Auto-Stop EC2 Lambda
        # ======================================================
        auto_stop_lambda_enhanced = _lambda.Function(
            self, "AutoStopEC2Enhanced",
            function_name="AutoStopEC2Enhanced",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="index.lambda_handler",
            role=lambda_role,
            code=_lambda.InlineCode("""
import boto3
import os
import datetime

ec2 = boto3.client('ec2')
cloudwatch = boto3.client('cloudwatch')
sns = boto3.client('sns')

def lambda_handler(event, context):
    stopped = []
    
    response = ec2.describe_instances(
        Filters=[{'Name': 'instance-state-name', 'Values': ['running']}]
    )
    
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instance_id = instance['InstanceId']
            
            end_time = datetime.datetime.utcnow()
            start_time = end_time - datetime.timedelta(minutes=5)
            
            metrics = cloudwatch.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='CPUUtilization',
                Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
                StartTime=start_time,
                EndTime=end_time,
                Period=300,
                Statistics=['Average']
            )
            
            datapoints = metrics.get('Datapoints', [])
            
            if datapoints and datapoints[0]['Average'] < 2:
                ec2.stop_instances(InstanceIds=[instance_id])
                stopped.append(instance_id)
    
    if stopped:
        sns.publish(
            TopicArn=os.environ['TOPIC_ARN'],
            Message=f"Stopped idle instances: {stopped}"
        )
            """),
            environment={"TOPIC_ARN": topic.topic_arn},
            timeout=Duration.seconds(60)
        )

        # ======================================================
        # SNS Topic Subscriptions
        # ======================================================
        # Note: Email subscription already added at line 33

        # Optional: Add more subscriptions
        # topic.add_subscription(subs.SqsSubscription(queue))
        # topic.add_subscription(subs.SlackChannelConfiguration(...))

        # ======================================================
        # CloudWatch Alarms for Lambda Errors
        # ======================================================
        for lambda_func, func_name in [
            (auto_stop_lambda_enhanced, "AutoStopEC2"),
            (s3_lambda, "S3Reverter"),
            (sg_lambda, "SGCleaner"),
            (cost_spike_lambda, "CostAlert")
        ]:
            error_alarm = cloudwatch.Alarm(
                self, f"{func_name}ErrorAlarm",
                metric=lambda_func.metric_errors(),
                threshold=1,
                evaluation_periods=1,
                alarm_description=f"Alert when {func_name} Lambda has errors"
            )
            error_alarm.add_alarm_action(cw_actions.SnsAction(topic))

        # ======================================================
        # CloudWatch Dashboard
        # ======================================================
        dashboard = cloudwatch.Dashboard(
            self, "CloudGovernanceDashboard",
            dashboard_name="CloudGovernanceMonitoring"
        )

        dashboard.add_widgets(
            cloudwatch.GraphWidget(
                title="Lambda Invocations",
                left=[
                    auto_stop_lambda_enhanced.metric_invocations(),
                ],
                width=12,
                height=6
            ),
            cloudwatch.GraphWidget(
                title="Lambda Errors",
                left=[
                    auto_stop_lambda_enhanced.metric_errors(),
                ],
                width=12,
                height=6
            ),
            cloudwatch.GraphWidget(
                title="Lambda Duration",
                left=[
                    auto_stop_lambda_enhanced.metric_duration(),
                ],
                width=12,
                height=6
            )
        )

        # ======================================================
        # Output Important Resource ARNs
        # ======================================================
        CfnOutput(
            self, "SNSTopicArn",
            value=topic.topic_arn,
            description="SNS Topic ARN for governance alerts"
        )

        CfnOutput(
            self, "CloudTrailBucketName",
            value=cloudtrail_bucket.bucket_name,
            description="S3 Bucket for CloudTrail logs"
        )

        CfnOutput(
            self, "AutoStopLambdaArn",
            value=auto_stop_lambda_enhanced.function_arn,
            description="Auto-Stop EC2 Lambda Function ARN"
        )

