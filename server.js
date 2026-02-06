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
        // Fetch upcoming movies from multiple regions
        const regions = ['US', 'IN', 'KR', 'JP', 'FR', 'DE', 'ES', 'IT', 'BR', 'MX'];
        const allMovies = [];

        for (const region of regions) {
            try {
                const url = `https://api.themoviedb.org/3/movie/upcoming?language=en-US&region=${region}&page=1`;
                const response = await fetch(url, tmdbAuthHeaders());
                if (response.ok) {
                    const payload = await response.json();
                    const items = Array.isArray(payload.results) ? payload.results.slice(0, 5) : [];
                    allMovies.push(...items);
                }
            } catch (e) {
                console.warn(`Failed to fetch from region ${region}:`, e.message);
            }
        }

        // Remove duplicates and limit to 20
        const uniqueMovies = allMovies.filter((movie, index, self) => 
            index === self.findIndex(m => m.id === movie.id)
        ).slice(0, 20);

        const mapped = uniqueMovies.map(mapTmdbMovieToPrediction);
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
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

function mapTmdbMovieToPrediction(item) {
    const imgBase = 'https://image.tmdb.org/t/p';
    const placeholder = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=1200&fit=crop';
    const poster = item.poster_path ? `${imgBase}/w500${item.poster_path}` : placeholder;
    
    // Simple ML-like prediction based on buzz factors
    const popularity = item.popularity || 0;
    const voteAverage = item.vote_average || 0;
    const voteCount = item.vote_count || 0;
    
    // Weighted prediction algorithm
    const buzzScore = (popularity * 0.4) + (voteAverage * 10 * 0.4) + (Math.log(voteCount + 1) * 2 * 0.2);
    const isHit = buzzScore > 50; // Threshold for hit prediction
    
    // Estimate collections based on buzz (in millions)
    const baseCollections = isHit ? Math.max(50, buzzScore * 2) : Math.max(10, buzzScore * 0.5);
    const collections = Math.round(baseCollections);
    
    // Returns percentage (ROI)
    const returns = isHit ? Math.round(150 + (buzzScore - 50) * 2) : Math.round(50 + buzzScore);
    
    // Confidence level
    const confidence = Math.min(95, Math.max(60, Math.round(buzzScore * 1.5)));
    
    // Detect language (simplified)
    const originalLanguage = item.original_language || 'en';
    const languageMap = {
        'en': 'English',
        'hi': 'Hindi',
        'te': 'Telugu',
        'ta': 'Tamil',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'ko': 'Korean',
        'ja': 'Japanese',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'pt': 'Portuguese'
    };
    const language = languageMap[originalLanguage] || 'English';

    return {
        id: item.id,
        title: item.title || item.name || 'Untitled',
        poster,
        releaseDate: item.release_date || 'TBD',
        language,
        prediction: {
            hit: isHit,
            collections: collections,
            returns: Math.min(500, returns), // Cap at 500%
            confidence
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
