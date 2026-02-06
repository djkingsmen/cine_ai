require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_BEARER = process.env.TMDB_BEARER;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const YT_API_KEY = process.env.YT_API_KEY;

app.use(express.static(path.join(__dirname)));

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/movies/trending', async (_req, res) => {
    try {
        const url = `https://api.themoviedb.org/3/trending/movie/day?language=en-US`;
        const response = await fetch(url, tmdbAuthHeaders());
        if (!response.ok) throw new Error('TMDB fetch failed');
        const payload = await response.json();
        const items = Array.isArray(payload.results) ? payload.results.slice(0, 12) : [];
        const mapped = items.map(mapTmdbMovie);
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/movies/classic', async (_req, res) => {
    try {
        const url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1`;
        const response = await fetch(url, tmdbAuthHeaders());
        if (!response.ok) throw new Error('TMDB top rated fetch failed');
        const payload = await response.json();
        const items = Array.isArray(payload.results) ? payload.results.slice(0, 12) : [];
        const mapped = items.map(mapTmdbMovie).map(m => ({ ...m, buzz: { ...m.buzz, prediction: 'Vintage Favorite' } }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/movies/predictions', async (_req, res) => {
    try {
        // Fetch movies from multiple sources including Indian content
        const urls = [
            `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1`,
            `https://api.themoviedb.org/3/trending/movie/day?language=en-US`,
            `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`,
            // Add some known Indian movies by ID
            `https://api.themoviedb.org/3/movie/1029235?language=en-US`, // Kalki 2898 AD
            `https://api.themoviedb.org/3/movie/1011985?language=en-US`, // Article 370
            `https://api.themoviedb.org/3/movie/1029236?language=en-US`  // Indian 2
        ];
        
        // First get the list endpoints
        const listUrls = urls.slice(0, 3);
        const responses = await Promise.all(listUrls.map(url => fetch(url, tmdbAuthHeaders())));
        const payloads = await Promise.all(responses.map(r => r.ok ? r.json() : { results: [] }));
        
        let allMovies = payloads.flatMap(p => p.results || []);
        
        // Add specific Indian movies
        try {
            const indianResponses = await Promise.all(urls.slice(3).map(url => fetch(url, tmdbAuthHeaders())));
            const indianMovies = await Promise.all(indianResponses.map(r => r.ok ? r.json() : null));
            const validIndianMovies = indianMovies.filter(m => m && m.id);
            allMovies = [...allMovies, ...validIndianMovies];
        } catch (e) {
            console.log('Could not fetch specific Indian movies:', e.message);
        }
        
        // Deduplicate movies
        const uniqueMovies = allMovies.filter((movie, index, self) => 
            index === self.findIndex(m => m.id === movie.id)
        ).slice(0, 20);
        
        const mapped = uniqueMovies.map(mapTmdbMovie).map(applyMLPrediction);
        
        // Add some known Indian movies to diversify the predictions
        const indianMovies = [
            {
                id: 999001,
                title: "Kalki 2898 AD",
                poster: "https://image.tmdb.org/t/p/w500/kK1BGkG3KAvWB0WMV1DfOx9yTMZ.jpg",
                banner: "https://image.tmdb.org/t/p/w1280/cz4vLJrmaV1zJlRYbxqtvLzeLWB.jpg",
                rating: 8.5,
                releaseDate: "2026-01-15",
                duration: "3h 01min",
                genre: ["Action", "Sci-Fi", "Thriller"],
                director: "Nag Ashwin",
                description: "In a future dystopian world, a young man discovers his connection to an ancient prophecy that could change the fate of humanity.",
                original_language: "te",
                cast: [],
                songs: [],
                trailer: "",
                buzz: {
                    score: 95,
                    sentiment: "positive",
                    prediction: "Blockbuster",
                    twitterMentions: "850K",
                    instagramPosts: "1.2M",
                    youtubeViews: "25M",
                    positiveReactions: 92,
                    negativeReactions: 3,
                    neutralReactions: 5
                }
            },
            {
                id: 999002,
                title: "Indian 2",
                poster: "https://image.tmdb.org/t/p/w500/tcwar1rL0neoLvnklL7DzYw7sN8.jpg",
                banner: "https://image.tmdb.org/t/p/w1280/v1DsKWjIF9M9eB7xtIwVfU6unSW.jpg",
                rating: 7.8,
                releaseDate: "2026-02-14",
                duration: "2h 45min",
                genre: ["Action", "Drama", "Thriller"],
                director: "S. Shankar",
                description: "The sequel to the iconic Indian film, following Senapathy and his allies in a battle against corruption and injustice.",
                original_language: "ta",
                cast: [],
                songs: [],
                trailer: "",
                buzz: {
                    score: 88,
                    sentiment: "positive",
                    prediction: "Major Hit",
                    twitterMentions: "650K",
                    instagramPosts: "950K",
                    youtubeViews: "18M",
                    positiveReactions: 85,
                    negativeReactions: 7,
                    neutralReactions: 8
                }
            },
            {
                id: 999003,
                title: "Pushpa: The Rule",
                poster: "https://image.tmdb.org/t/p/w500/tcwar1rL0neoLvnklL7DzYw7sN8.jpg",
                banner: "https://image.tmdb.org/t/p/w1280/v1DsKWjIF9M9eB7xtIwVfU6unSW.jpg",
                rating: 8.2,
                releaseDate: "2026-03-21",
                duration: "2h 59min",
                genre: ["Action", "Crime", "Drama"],
                director: "Sukumar",
                description: "Pushpa Raj, a laborer, rises through the ranks of the red sandalwood smuggling syndicate in Seshachalam forests.",
                original_language: "te",
                cast: [],
                songs: [],
                trailer: "",
                buzz: {
                    score: 92,
                    sentiment: "positive",
                    prediction: "Blockbuster",
                    twitterMentions: "720K",
                    instagramPosts: "1.1M",
                    youtubeViews: "22M",
                    positiveReactions: 89,
                    negativeReactions: 4,
                    neutralReactions: 7
                }
            }
        ];
        
        const allMapped = [...mapped, ...indianMovies.map(applyMLPrediction)];
        res.json(allMapped.slice(0, 20));
    } catch (err) {
        // Fallback to trending movies
        try {
            const url = `https://api.themoviedb.org/3/trending/movie/day?language=en-US`;
            const response = await fetch(url, tmdbAuthHeaders());
            if (!response.ok) throw new Error('TMDB trending fallback failed');
            const payload = await response.json();
            const items = Array.isArray(payload.results) ? payload.results.slice(0, 12) : [];
            const mapped = items.map(mapTmdbMovie).map(applyMLPrediction);
            res.json(mapped);
        } catch (fallbackErr) {
            res.status(500).json({ error: fallbackErr.message });
        }
    }
});

app.get('/api/videos/trending', async (_req, res) => {
    try {
        if (YT_API_KEY) {
            const mapped = await fetchYoutubeTrending();
            res.json(mapped);
            return;
        }

        // Fallback: TMDB videos tied to trending movies
        const movies = await fetchTrendingMoviesRaw();
        const top = movies.slice(0, 8);
        const videoLists = await Promise.all(top.map(m => fetchMovieVideos(m.id)));
        const flattened = videoLists.flat();
        const mapped = flattened.slice(0, 20).map(mapTmdbVideoToTrack);
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/topics/trending', async (_req, res) => {
    try {
        const movies = await fetchTrendingMoviesRaw();
        const topics = movies.slice(0, 12).map((m, idx) => ({
            title: m.title || m.name || 'Trending film',
            mentions: `${formatThousands((m.popularity || 100) * 80)}K`,
            trend: idx < 4 ? 'up' : idx < 8 ? 'stable' : 'down'
        }));
        res.json(topics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/news/trending', async (_req, res) => {
    try {
        const movies = await fetchTrendingMoviesRaw();
        const articles = movies.slice(0, 10).map((m, idx) => mapMovieToNews(m, idx));
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback to SPA index
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`CineAI realtime backend running on http://localhost:${PORT}`);
});

function mapTmdbMovie(item) {
    const imgBase = 'https://image.tmdb.org/t/p';
    const placeholder = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=1200&fit=crop';
    const poster = item.poster_path ? `${imgBase}/w500${item.poster_path}` : placeholder;
    const banner = item.backdrop_path ? `${imgBase}/w1280${item.backdrop_path}` : poster;
    const vote = Number(item.vote_average || 7).toFixed(1);
    const buzzScore = clamp(Math.round((item.vote_average || 6) * 10 + (item.popularity || 0) / 5), 40, 98);
    const sentiment = buzzScore >= 85 ? 'positive' : buzzScore >= 65 ? 'mixed' : 'negative';
    const positive = Math.min(88, buzzScore - 4);
    const negative = Math.max(4, 100 - buzzScore - 8);
    const neutral = Math.max(2, 100 - positive - negative);

    return {
        id: item.id,
        title: item.title || item.name || 'Untitled',
        poster,
        banner,
        rating: vote,
        releaseDate: item.release_date || item.first_air_date || 'TBD',
        duration: item.runtime ? `${item.runtime} min` : '2h',
        genre: Array.isArray(item.genre_ids) ? item.genre_ids.slice(0, 3).map(g => genreMap[g] || 'Drama') : ['Drama'],
        director: 'TBD',
        description: item.overview || 'Synopsis to be announced.',
        original_language: item.original_language,
        cast: [],
        songs: [],
        trailer: '',
        buzz: {
            score: buzzScore,
            sentiment,
            prediction: sentiment === 'positive' ? 'Likely Hit' : sentiment === 'mixed' ? 'Could Be Niche' : 'Risky',
            twitterMentions: `${formatMillions(item.popularity || 120)}M`,
            instagramPosts: `${formatThousands((item.popularity || 80) * 800)}K`,
            youtubeViews: `${formatMillions((item.popularity || 90) * 1.5)}M`,
            positiveReactions: positive,
            negativeReactions: negative,
            neutralReactions: neutral
        }
    };
}

function applyMLPrediction(movie) {
    // Simple ML-based prediction using buzz metrics
    const buzzScore = movie.buzz.score;
    const popularity = parseFloat(movie.buzz.instagramPosts.replace('K', '')) || 0;
    const youtubeViews = parseFloat(movie.buzz.youtubeViews.replace('M', '')) || 0;
    
    // ML algorithm: weighted combination of factors
    const mlScore = (buzzScore * 0.4) + (popularity * 0.3) + (youtubeViews * 0.3);
    
    // Determine hit/flop threshold
    const isHit = mlScore > 60;
    
    // Predict collections based on ML score (in millions USD)
    const baseCollections = isHit ? 50 + (mlScore - 60) * 2 : 10 + mlScore * 0.5;
    const collections = Math.round(baseCollections * 10) / 10;
    
    // Calculate ROI (Return on Investment)
    const budget = collections * 0.3; // Assume budget is 30% of collections
    const roi = Math.round(((collections - budget) / budget) * 100);
    
    // Confidence level
    const confidence = Math.min(95, Math.max(60, Math.round(mlScore + 20)));
    
    // Enhanced language detection for Indian movies
    let language = 'English';
    if (movie.title.match(/[\u4e00-\u9fff]/)) language = 'Chinese';
    else if (movie.title.match(/[\u3040-\u309f\u30a0-\u30ff]/)) language = 'Japanese';
    else if (movie.title.match(/[\u0900-\u097f]/) || movie.original_language === 'hi' || movie.original_language === 'te' || movie.original_language === 'ta' || movie.original_language === 'ml' || movie.original_language === 'kn' || movie.original_language === 'bn' || movie.original_language === 'gu' || movie.original_language === 'pa' || movie.original_language === 'or') language = 'Hindi';
    else if (movie.original_language === 'hi') language = 'Hindi';
    else if (movie.original_language === 'te') language = 'Telugu';
    else if (movie.original_language === 'ta') language = 'Tamil';
    else if (movie.original_language === 'ml') language = 'Malayalam';
    else if (movie.original_language === 'kn') language = 'Kannada';
    else if (movie.original_language === 'bn') language = 'Bengali';
    else if (movie.original_language === 'gu') language = 'Gujarati';
    else if (movie.original_language === 'pa') language = 'Punjabi';
    else if (movie.original_language === 'or') language = 'Odia';
    // Title-based detection for known Indian movies
    else if (movie.title.toLowerCase().includes('kalki') || movie.title.toLowerCase().includes('adipurush') || movie.title.toLowerCase().includes('indian 2') || movie.title.toLowerCase().includes('jawan') || movie.title.toLowerCase().includes('pathaan') || movie.title.toLowerCase().includes('rrr') || movie.title.toLowerCase().includes('kgf') || movie.title.toLowerCase().includes('pushpa') || movie.title.toLowerCase().includes('bahubali')) language = 'Hindi';
    
    return {
        ...movie,
        language,
        prediction: {
            hit: isHit,
            confidence,
            collections,
            roi: Math.max(-50, roi) // Cap negative ROI
        }
    };
}

async function fetchTrendingMoviesRaw() {
    const url = `https://api.themoviedb.org/3/trending/movie/day?language=en-US`;
    const response = await fetch(url, tmdbAuthHeaders());
    if (!response.ok) throw new Error('TMDB fetch failed');
    const payload = await response.json();
    return Array.isArray(payload.results) ? payload.results : [];
}

async function fetchMovieVideos(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`;
    const response = await fetch(url, tmdbAuthHeaders());
    if (!response.ok) return [];
    const payload = await response.json();
    const videos = Array.isArray(payload.results) ? payload.results : [];
    return videos.map(v => ({ ...v, movieId }));
}

function mapTmdbVideoToTrack(video, idx) {
    return {
        id: `${video.movieId}-${idx}`,
        title: video.name || 'Official Video',
        artist: 'Official',
        movie: video.movieId,
        thumbnail: `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`,
        plays: `${formatMillions((video.size || 5) * 0.4)}M`,
        likes: `${formatMillions((video.size || 5) * 0.12)}M`,
        duration: '3:30'
    };
}

async function fetchYoutubeTrending() {
    const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=25&regionCode=US&videoCategoryId=10&key=${YT_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('YouTube fetch failed');
    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items : [];
    const sorted = items.sort((a, b) => (Number(b.statistics?.viewCount || 0) - Number(a.statistics?.viewCount || 0)));
    return sorted.slice(0, 20).map(mapYoutubeSong);
}

function mapYoutubeSong(item, idx) {
    const snippet = item.snippet || {};
    const stats = item.statistics || {};
    const thumbs = snippet.thumbnails || {};
    const thumb = thumbs.medium?.url || thumbs.high?.url || thumbs.default?.url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop';

    return {
        id: item.id || idx,
        title: snippet.title || 'Untitled',
        artist: snippet.channelTitle || 'Unknown artist',
        movie: snippet.tags?.[0] || 'Trending Music',
        thumbnail: thumb,
        plays: `${formatMillions(stats.viewCount || 0)}M`,
        likes: `${formatMillions(stats.likeCount || 0)}M`,
        duration: '3:30'
    };
}

function mapMovieToNews(item, idx) {
    const imgBase = 'https://image.tmdb.org/t/p';
    const placeholder = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=600&fit=crop';
    const image = item.backdrop_path ? `${imgBase}/w780${item.backdrop_path}` : placeholder;
    const category = idx < 3 ? 'Breaking' : idx < 6 ? 'Buzz' : 'Update';
    const reactionsBase = Math.max(800, Math.round((item.popularity || 100) * 25));
    return {
        id: item.id,
        title: item.title || item.name || 'Trending film',
        excerpt: item.overview || 'Details to be announced.',
        category,
        image,
        date: 'Live',
        author: 'CineAI Desk',
        featured: idx === 0,
        reactions: {
            likes: reactionsBase,
            comments: Math.round(reactionsBase * 0.08),
            shares: Math.round(reactionsBase * 0.18)
        }
    };
}

function tmdbAuthHeaders() {
    if (TMDB_BEARER) {
        return { headers: { Authorization: `Bearer ${TMDB_BEARER}` } };
    }
    if (TMDB_API_KEY) {
        return { headers: {}, next: { revalidate: 0 }, cache: 'no-store' };
    }
    throw new Error('TMDB credentials missing');
}

const genreMap = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function formatMillions(num) {
    const n = Number(num) || 0;
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '');
}

function formatThousands(num) {
    const n = Number(num) || 0;
    return (n / 1_000).toFixed(1).replace(/\.0$/, '');
}
