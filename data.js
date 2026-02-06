// Movie Database (mutable for live updates)
let movies = [
    {
        id: 1,
        title: "Avatar: The Last Frontier",
        poster: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400&h=600&fit=crop",
        banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=600&fit=crop",
        rating: 8.9,
        releaseDate: "March 15, 2026",
        duration: "3h 12min",
        genre: ["action", "Sci-Fi", "Adventure"],
        director: "James Cameron",
        description: "Return to the mystical world of Pandora in this groundbreaking sequel that pushes the boundaries of visual storytelling. Jake Sully and Neytiri must protect their family from an ancient threat that emerges from the depths of the ocean.",
        cast: [
            { name: "Sam Worthington", role: "Jake Sully", image: "https://randomuser.me/api/portraits/men/1.jpg" },
            { name: "Zoe Saldana", role: "Neytiri", image: "https://randomuser.me/api/portraits/women/1.jpg" },
            { name: "Sigourney Weaver", role: "Kiri", image: "https://randomuser.me/api/portraits/women/2.jpg" },
            { name: "Kate Winslet", role: "Ronal", image: "https://randomuser.me/api/portraits/women/3.jpg" }
        ],
        songs: [
            { title: "Into the Deep", artist: "The Weeknd", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" },
            { title: "Pandora Rising", artist: "Sia", thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop" }
        ],
        trailer: "https://www.youtube.com/embed/d9MyW72ELq0",
        buzz: {
            score: 92,
            sentiment: "positive",
            prediction: "Blockbuster Hit",
            twitterMentions: "2.4M",
            instagramPosts: "890K",
            youtubeViews: "45M",
            positiveReactions: 85,
            negativeReactions: 8,
            neutralReactions: 7
        }
    },
    {
        id: 2,
        title: "The Dark Phoenix Rises",
        poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
        banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop",
        rating: 8.5,
        releaseDate: "April 22, 2026",
        duration: "2h 45min",
        genre: ["action", "thriller", "Drama"],
        director: "Christopher Nolan",
        description: "A psychological thriller that explores the depths of human consciousness through the eyes of a detective haunted by his past. When reality begins to blur with nightmares, he must solve the case before losing his mind.",
        cast: [
            { name: "Christian Bale", role: "Detective Kane", image: "https://randomuser.me/api/portraits/men/2.jpg" },
            { name: "Florence Pugh", role: "Dr. Elena", image: "https://randomuser.me/api/portraits/women/4.jpg" },
            { name: "Tom Hardy", role: "The Shadow", image: "https://randomuser.me/api/portraits/men/3.jpg" }
        ],
        songs: [
            { title: "Shadows Within", artist: "Hans Zimmer", thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop" }
        ],
        trailer: "https://www.youtube.com/embed/EXeTwQWrcwY",
        buzz: {
            score: 88,
            sentiment: "positive",
            prediction: "Critical Acclaim",
            twitterMentions: "1.8M",
            instagramPosts: "650K",
            youtubeViews: "32M",
            positiveReactions: 78,
            negativeReactions: 12,
            neutralReactions: 10
        }
    },
    {
        id: 3,
        title: "Love in Paris",
        poster: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=600&fit=crop",
        banner: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&h=600&fit=crop",
        rating: 7.8,
        releaseDate: "February 14, 2026",
        duration: "2h 05min",
        genre: ["romance", "comedy", "Drama"],
        director: "Nancy Meyers",
        description: "A heartwarming romantic comedy about two strangers who meet during a chance encounter at the Eiffel Tower. As they explore the city of love together, they discover that sometimes the best relationships start with the most unexpected connections.",
        cast: [
            { name: "Emma Stone", role: "Sophie", image: "https://randomuser.me/api/portraits/women/5.jpg" },
            { name: "Ryan Gosling", role: "Lucas", image: "https://randomuser.me/api/portraits/men/4.jpg" },
            { name: "Léa Seydoux", role: "Marie", image: "https://randomuser.me/api/portraits/women/6.jpg" }
        ],
        songs: [
            { title: "Paris Nights", artist: "Ed Sheeran", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" },
            { title: "Je T'aime", artist: "Adele", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" }
        ],
        trailer: "https://www.youtube.com/embed/EXeTwQWrcwY",
        buzz: {
            score: 75,
            sentiment: "positive",
            prediction: "Romantic Hit",
            twitterMentions: "980K",
            instagramPosts: "420K",
            youtubeViews: "18M",
            positiveReactions: 72,
            negativeReactions: 15,
            neutralReactions: 13
        }
    },
    {
        id: 4,
        title: "Quantum Horizon",
        poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop",
        banner: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=600&fit=crop",
        rating: 8.7,
        releaseDate: "May 30, 2026",
        duration: "2h 38min",
        genre: ["action", "Sci-Fi", "thriller"],
        director: "Denis Villeneuve",
        description: "In a future where time travel is possible but forbidden, a physicist discovers a conspiracy that threatens to unravel the fabric of reality itself. She must race against time to prevent a catastrophe that could erase humanity from existence.",
        cast: [
            { name: "Timothée Chalamet", role: "Dr. Marcus Webb", image: "https://randomuser.me/api/portraits/men/5.jpg" },
            { name: "Zendaya", role: "Agent Sarah Cole", image: "https://randomuser.me/api/portraits/women/7.jpg" },
            { name: "Oscar Isaac", role: "Director Hayes", image: "https://randomuser.me/api/portraits/men/6.jpg" }
        ],
        songs: [
            { title: "Time Loop", artist: "Daft Punk", thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop" }
        ],
        trailer: "https://www.youtube.com/embed/d9MyW72ELq0",
        buzz: {
            score: 89,
            sentiment: "positive",
            prediction: "Sci-Fi Masterpiece",
            twitterMentions: "2.1M",
            instagramPosts: "780K",
            youtubeViews: "38M",
            positiveReactions: 82,
            negativeReactions: 10,
            neutralReactions: 8
        }
    },
    {
        id: 5,
        title: "The Last Laugh",
        poster: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=600&fit=crop",
        banner: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop",
        rating: 7.5,
        releaseDate: "July 12, 2026",
        duration: "1h 55min",
        genre: ["comedy", "Drama"],
        director: "Taika Waititi",
        description: "A washed-up comedian gets one last chance at redemption when he's invited to perform at the biggest comedy festival in the world. But can he overcome his demons and deliver the performance of a lifetime?",
        cast: [
            { name: "Adam Sandler", role: "Jerry Miller", image: "https://randomuser.me/api/portraits/men/7.jpg" },
            { name: "Jennifer Aniston", role: "Carol", image: "https://randomuser.me/api/portraits/women/8.jpg" },
            { name: "Kevin Hart", role: "Marcus", image: "https://randomuser.me/api/portraits/men/8.jpg" }
        ],
        songs: [
            { title: "Stand Up", artist: "Bruno Mars", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" }
        ],
        trailer: "https://www.youtube.com/embed/EXeTwQWrcwY",
        buzz: {
            score: 68,
            sentiment: "mixed",
            prediction: "Moderate Success",
            twitterMentions: "560K",
            instagramPosts: "280K",
            youtubeViews: "12M",
            positiveReactions: 55,
            negativeReactions: 25,
            neutralReactions: 20
        }
    },
    {
        id: 6,
        title: "Kingdom of Shadows",
        poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop",
        banner: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1200&h=600&fit=crop",
        rating: 8.2,
        releaseDate: "August 20, 2026",
        duration: "2h 50min",
        genre: ["action", "Drama", "Fantasy"],
        director: "Peter Jackson",
        description: "An epic fantasy adventure following a young prince who must reclaim his stolen kingdom from dark forces. With the help of unlikely allies, he embarks on a perilous journey across treacherous lands.",
        cast: [
            { name: "Dev Patel", role: "Prince Amir", image: "https://randomuser.me/api/portraits/men/9.jpg" },
            { name: "Cate Blanchett", role: "The Sorceress", image: "https://randomuser.me/api/portraits/women/9.jpg" },
            { name: "Idris Elba", role: "General Thorne", image: "https://randomuser.me/api/portraits/men/10.jpg" }
        ],
        songs: [
            { title: "Rise of Heroes", artist: "Imagine Dragons", thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop" },
            { title: "Epic Battle", artist: "Two Steps from Hell", thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop" }
        ],
        trailer: "https://www.youtube.com/embed/d9MyW72ELq0",
        buzz: {
            score: 84,
            sentiment: "positive",
            prediction: "Box Office Hit",
            twitterMentions: "1.5M",
            instagramPosts: "520K",
            youtubeViews: "28M",
            positiveReactions: 76,
            negativeReactions: 14,
            neutralReactions: 10
        }
    },
    {
        id: 7,
        title: "Midnight Express",
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
        banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop",
        rating: 8.0,
        releaseDate: "September 15, 2026",
        duration: "2h 20min",
        genre: ["thriller", "action", "Mystery"],
        director: "David Fincher",
        description: "On a train speeding through the night, a group of strangers discover they're all connected to a decades-old heist. When a murder occurs, they must work together to survive and uncover the truth.",
        cast: [
            { name: "Michael Fassbender", role: "The Stranger", image: "https://randomuser.me/api/portraits/men/11.jpg" },
            { name: "Margot Robbie", role: "The Journalist", image: "https://randomuser.me/api/portraits/women/10.jpg" },
            { name: "Daniel Kaluuya", role: "The Detective", image: "https://randomuser.me/api/portraits/men/12.jpg" }
        ],
        songs: [
            { title: "Night Train", artist: "Lana Del Rey", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" }
        ],
        trailer: "https://www.youtube.com/embed/EXeTwQWrcwY",
        buzz: {
            score: 79,
            sentiment: "positive",
            prediction: "Thriller of the Year",
            twitterMentions: "1.2M",
            instagramPosts: "450K",
            youtubeViews: "22M",
            positiveReactions: 71,
            negativeReactions: 16,
            neutralReactions: 13
        }
    },
    {
        id: 8,
        title: "The Ocean's Secret",
        poster: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop",
        banner: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=600&fit=crop",
        rating: 7.9,
        releaseDate: "October 5, 2026",
        duration: "2h 15min",
        genre: ["drama", "Adventure", "Mystery"],
        director: "Kathryn Bigelow",
        description: "A marine biologist discovers an ancient underwater civilization that holds the key to saving humanity from climate catastrophe. But powerful forces will stop at nothing to keep this secret buried.",
        cast: [
            { name: "Gal Gadot", role: "Dr. Marina Wells", image: "https://randomuser.me/api/portraits/women/11.jpg" },
            { name: "Jason Momoa", role: "Captain Drake", image: "https://randomuser.me/api/portraits/men/13.jpg" },
            { name: "Lupita Nyong'o", role: "Dr. Okonkwo", image: "https://randomuser.me/api/portraits/women/12.jpg" }
        ],
        songs: [
            { title: "Deep Blue", artist: "Billie Eilish", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" },
            { title: "Waves", artist: "Coldplay", thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop" }
        ],
        trailer: "https://www.youtube.com/embed/d9MyW72ELq0",
        buzz: {
            score: 72,
            sentiment: "mixed",
            prediction: "Sleeper Hit",
            twitterMentions: "680K",
            instagramPosts: "310K",
            youtubeViews: "15M",
            positiveReactions: 62,
            negativeReactions: 20,
            neutralReactions: 18
        }
    }
];

// Classic/archived movies (TMDB top-rated) for vintage predictions
let classicMovies = [];

// Trending Songs (mutable for live updates)
let trendingSongs = [
    {
        id: 1,
        title: "Into the Deep",
        artist: "The Weeknd",
        movie: "Avatar: The Last Frontier",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
        plays: "45.2M",
        likes: "3.2M",
        duration: "3:45"
    },
    {
        id: 2,
        title: "Shadows Within",
        artist: "Hans Zimmer",
        movie: "The Dark Phoenix Rises",
        thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop",
        plays: "38.7M",
        likes: "2.8M",
        duration: "4:12"
    },
    {
        id: 3,
        title: "Paris Nights",
        artist: "Ed Sheeran",
        movie: "Love in Paris",
        thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop",
        plays: "32.1M",
        likes: "2.5M",
        duration: "3:28"
    },
    {
        id: 4,
        title: "Time Loop",
        artist: "Daft Punk",
        movie: "Quantum Horizon",
        thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop",
        plays: "28.9M",
        likes: "2.1M",
        duration: "5:02"
    },
    {
        id: 5,
        title: "Rise of Heroes",
        artist: "Imagine Dragons",
        movie: "Kingdom of Shadows",
        thumbnail: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop",
        plays: "25.4M",
        likes: "1.9M",
        duration: "4:35"
    },
    {
        id: 6,
        title: "Deep Blue",
        artist: "Billie Eilish",
        movie: "The Ocean's Secret",
        thumbnail: "https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=200&h=200&fit=crop",
        plays: "22.8M",
        likes: "1.7M",
        duration: "3:52"
    },
    {
        id: 7,
        title: "Night Train",
        artist: "Lana Del Rey",
        movie: "Midnight Express",
        thumbnail: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=200&h=200&fit=crop",
        plays: "20.1M",
        likes: "1.5M",
        duration: "4:18"
    },
    {
        id: 8,
        title: "Stand Up",
        artist: "Bruno Mars",
        movie: "The Last Laugh",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
        plays: "18.5M",
        likes: "1.3M",
        duration: "3:15"
    }
];

// News Articles (mutable for live TMDB news)
let newsArticles = [
    {
        id: 1,
        title: "Avatar: The Last Frontier Set to Break Box Office Records",
        excerpt: "James Cameron's highly anticipated sequel has generated unprecedented buzz, with AI predictions suggesting it could become the highest-grossing film of all time. Early screenings have left audiences speechless.",
        category: "Box Office",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=400&fit=crop",
        date: "2 hours ago",
        author: "Sarah Johnson",
        featured: true,
        reactions: { likes: 15420, comments: 892, shares: 2340 }
    },
    {
        id: 2,
        title: "Christopher Nolan's 'The Dark Phoenix Rises' Gets Standing Ovation at Private Screening",
        excerpt: "Industry insiders report that the psychological thriller received a 10-minute standing ovation. Oscar buzz is already building for lead actor Christian Bale's transformative performance.",
        category: "Premiere",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop",
        date: "5 hours ago",
        author: "Michael Chen",
        featured: false,
        reactions: { likes: 8920, comments: 456, shares: 1230 }
    },
    {
        id: 3,
        title: "The Weeknd's 'Into the Deep' Breaks Streaming Records on First Day",
        excerpt: "The lead single from Avatar: The Last Frontier soundtrack has shattered Spotify's first-day streaming record with over 45 million plays within 24 hours.",
        category: "Music",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
        date: "8 hours ago",
        author: "Emily Rodriguez",
        featured: false,
        reactions: { likes: 12350, comments: 678, shares: 3450 }
    },
    {
        id: 4,
        title: "Timothée Chalamet and Zendaya Reunite for Quantum Horizon",
        excerpt: "The beloved on-screen pair from Dune is back together in Denis Villeneuve's mind-bending sci-fi thriller. Fans are ecstatic about the reunion.",
        category: "Celebrity",
        image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=400&fit=crop",
        date: "12 hours ago",
        author: "James Williams",
        featured: false,
        reactions: { likes: 18750, comments: 1234, shares: 4560 }
    },
    {
        id: 5,
        title: "AI Predicts 'Love in Paris' Will Dominate Valentine's Day Box Office",
        excerpt: "Our machine learning model analyzed social media sentiment and predicts Emma Stone's romantic comedy will earn $85M on opening weekend.",
        category: "AI Prediction",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=400&fit=crop",
        date: "1 day ago",
        author: "Dr. Alex Turner",
        featured: false,
        reactions: { likes: 6780, comments: 345, shares: 890 }
    },
    {
        id: 6,
        title: "Peter Jackson Returns to Epic Fantasy with 'Kingdom of Shadows'",
        excerpt: "The Lord of the Rings director brings his visual mastery to a new fantasy saga. Early footage reveals stunning practical effects combined with cutting-edge CGI.",
        category: "Production",
        image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&h=400&fit=crop",
        date: "1 day ago",
        author: "Robert Thompson",
        featured: false,
        reactions: { likes: 9450, comments: 567, shares: 1890 }
    }
];

// Hot Topics (mutable for live Twitter sync)
let hotTopics = [
    { title: "Avatar franchise future plans revealed", mentions: "45.2K", trend: "up" },
    { title: "Oscars 2026 early predictions", mentions: "38.1K", trend: "up" },
    { title: "Summer blockbusters lineup", mentions: "32.8K", trend: "stable" },
    { title: "Streaming vs Theater debate", mentions: "28.4K", trend: "down" },
    { title: "Superhero fatigue discussion", mentions: "24.9K", trend: "up" }
];

// Celebrities
const celebrities = [
    { id: 1, name: "Timothée Chalamet", role: "Actor", image: "https://randomuser.me/api/portraits/men/5.jpg", followers: "42M" },
    { id: 2, name: "Zendaya", role: "Actress", image: "https://randomuser.me/api/portraits/women/7.jpg", followers: "185M" },
    { id: 3, name: "Emma Stone", role: "Actress", image: "https://randomuser.me/api/portraits/women/5.jpg", followers: "38M" },
    { id: 4, name: "Ryan Gosling", role: "Actor", image: "https://randomuser.me/api/portraits/men/4.jpg", followers: "25M" },
    { id: 5, name: "Florence Pugh", role: "Actress", image: "https://randomuser.me/api/portraits/women/4.jpg", followers: "28M" },
    { id: 6, name: "Christian Bale", role: "Actor", image: "https://randomuser.me/api/portraits/men/2.jpg", followers: "15M" },
    { id: 7, name: "Margot Robbie", role: "Actress", image: "https://randomuser.me/api/portraits/women/10.jpg", followers: "45M" },
    { id: 8, name: "Dev Patel", role: "Actor", image: "https://randomuser.me/api/portraits/men/9.jpg", followers: "12M" },
    { id: 9, name: "Gal Gadot", role: "Actress", image: "https://randomuser.me/api/portraits/women/11.jpg", followers: "98M" },
    { id: 10, name: "Idris Elba", role: "Actor", image: "https://randomuser.me/api/portraits/men/10.jpg", followers: "18M" }
];

// AI Prediction Model (Simulated)
const AIPredictor = {
    analyzeSentiment: (movie) => {
        // Simulated AI sentiment analysis based on buzz score
        const score = movie.buzz.score;
        if (score >= 85) return { emoji: "🔥", label: "Extremely Positive", color: "positive" };
        if (score >= 70) return { emoji: "😊", label: "Positive", color: "positive" };
        if (score >= 50) return { emoji: "😐", label: "Mixed", color: "mixed" };
        return { emoji: "😟", label: "Concerning", color: "negative" };
    },
    
    predictBoxOffice: (movie) => {
        // Simulated box office prediction
        const base = movie.buzz.score * 2;
        const variance = Math.random() * 30 - 15;
        return `$${Math.round(base + variance)}M - $${Math.round(base + variance + 50)}M`;
    },
    
    getConfidence: (movie) => {
        // AI confidence level
        return Math.min(95, movie.buzz.score + Math.floor(Math.random() * 10));
    },
    
    getTrendingScore: (movie) => {
        // Calculate trending score
        const mentions = parseInt(movie.buzz.twitterMentions.replace(/[^0-9.]/g, ''));
        const views = parseInt(movie.buzz.youtubeViews.replace(/[^0-9.]/g, ''));
        return ((mentions + views) / 2).toFixed(1);
    }
};
