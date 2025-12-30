#!/usr/bin/env python3
import aws_cdk as cdk
from cloud_governance.cloud_governance_stack import CloudGovernanceStack

app = cdk.App()
CloudGovernanceStack(app, "CloudGovernanceStack",
    env=cdk.Environment(account="477345795074", region="eu-north-1")
)
app.synth()
