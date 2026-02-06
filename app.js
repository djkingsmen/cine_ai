// DOM Elements
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');
const heroSlider = document.getElementById('heroSlider');
const heroIndicators = document.getElementById('heroIndicators');
const searchInput = document.getElementById('searchInput');

// State
let currentSlide = 0;
let currentSong = null;
let isPlaying = false;
let chatTopic = null;
let chatThreads = {};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    renderHeroSlider();
    renderUpcomingMovies();
    renderBuzzPredictions();
    renderAllMovies();
    renderTrendingSongs();
    renderTrendingMovies();
    renderPredictions();
    renderNews();
    renderHotTopics();
    setupEventListeners();
    startHeroAutoplay();
        startRealtimeSync();
}

    // Live sync against backend APIs (TMDB/YouTube) with graceful fallback
    const API_REFRESH_MS = 180000; // 3 minutes

    async function startRealtimeSync() {
        await fetchRealtimeData();
        setInterval(fetchRealtimeData, API_REFRESH_MS);
    }

    async function fetchRealtimeData() {
        await Promise.all([
            fetchTrendingMoviesAPI(),
            fetchTrendingSongsAPI(),
            fetchClassicMoviesAPI(),
            fetchPredictionsAPI(),
            fetchTrendingTopicsAPI(),
            fetchNewsAPI()
        ]);
    }

    async function fetchTrendingMoviesAPI() {
        try {
            const res = await fetch('/api/movies/trending');
            if (!res.ok) throw new Error('Movies API unavailable');
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Empty movies payload');

            movies = data;
            renderHeroSlider();
            renderUpcomingMovies();
            renderBuzzPredictions();
            renderAllMovies();
            renderTrendingMovies();
            updateIndicators();
        } catch (err) {
            console.warn('Using local movie data fallback:', err.message);
        }
    }

    async function fetchTrendingSongsAPI() {
        try {
            const res = await fetch('/api/videos/trending');
            if (!res.ok) throw new Error('Songs API unavailable');
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Empty songs payload');

            trendingSongs = data;
            renderTrendingSongs();
        } catch (err) {
            console.warn('Using local songs fallback:', err.message);
        }
    }

    async function fetchClassicMoviesAPI() {
        try {
            const res = await fetch('/api/movies/classic');
            if (!res.ok) throw new Error('Classic movies API unavailable');
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Empty classics payload');

            classicMovies = data;
            renderAllMovies();
        } catch (err) {
            console.warn('Using local classics fallback:', err.message);
        }
    }

    async function fetchPredictionsAPI() {
        try {
            const res = await fetch('/api/movies/predictions');
            if (!res.ok) throw new Error('Predictions API unavailable');
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Empty predictions payload');

            renderPredictionsGrid(data);
        } catch (err) {
            console.warn('Predictions API failed:', err.message);
            renderPredictionsGrid([]);
        }
    }

    async function fetchTrendingTopicsAPI() {
        try {
            const res = await fetch('/api/topics/trending');
            if (!res.ok) throw new Error('Topics API unavailable');
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Empty topics payload');

            hotTopics = data;
            renderHotTopics();
        } catch (err) {
            console.warn('Using local hot topics fallback:', err.message);
        }
    }

    async function fetchNewsAPI() {
        try {
            const res = await fetch('/api/news/trending');
            if (!res.ok) throw new Error('News API unavailable');
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Empty news payload');

            newsArticles = data;
            renderNews();
        } catch (err) {
            console.warn('Using local news fallback:', err.message);
        }
    }

// Simulated real-time AI/ML refresh for buzz + social metrics

// Tab Navigation
function setupEventListeners() {
    // Main nav tabs
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterMovies(btn.dataset.filter));
    });

    // Trending sub-tabs
    document.querySelectorAll('.trending-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTrendingTab(btn.dataset.subtab));
    });

    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Modal close on backdrop
    document.getElementById('movieModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function switchTab(tabId) {
    navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

function switchTrendingTab(subtab) {
    document.querySelectorAll('.trending-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subtab === subtab);
    });
    document.getElementById('trendingSongs').classList.toggle('active', subtab === 'songs');
    document.getElementById('trendingMovies').classList.toggle('active', subtab === 'movies');
}

// Hero Slider
function renderHeroSlider() {
    const featuredMovies = movies.slice(0, 4);
    
    heroSlider.innerHTML = featuredMovies.map((movie, index) => `
        <div class="hero-slide" style="background-image: url('${movie.banner}')">
            <div class="hero-content">
                <span class="hero-badge">${movie.buzz.prediction}</span>
                <h1 class="hero-title">${movie.title}</h1>
                <div class="hero-meta">
                    <span><i class="fas fa-star" style="color: var(--secondary)"></i> ${movie.rating}</span>
                    <span><i class="fas fa-clock"></i> ${movie.duration}</span>
                    <span><i class="fas fa-calendar"></i> ${movie.releaseDate}</span>
                </div>
                <p class="hero-description">${movie.description.substring(0, 150)}...</p>
                <div class="hero-buttons">
                    <button class="btn-primary" onclick="openMovieModal(${movie.id})">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    heroIndicators.innerHTML = featuredMovies.map((_, index) => `
        <div class="hero-indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
    `).join('');
}

function goToSlide(index) {
    currentSlide = index;
    heroSlider.style.transform = `translateX(-${index * 100}%)`;
    updateIndicators();
}

function updateIndicators() {
    document.querySelectorAll('.hero-indicator').forEach((ind, i) => {
        ind.classList.toggle('active', i === currentSlide);
    });
}

function startHeroAutoplay() {
    setInterval(() => {
        const total = document.querySelectorAll('.hero-slide').length || 1;
        currentSlide = (currentSlide + 1) % total;
        goToSlide(currentSlide);
    }, 6000);
}

// Render Movies Grid
function renderUpcomingMovies() {
    const container = document.getElementById('upcomingMovies');
    container.innerHTML = movies.slice(0, 6).map(movie => createMovieCard(movie)).join('');
}

function renderAllMovies(filter = 'all') {
    const container = document.getElementById('allMovies');
    const all = getAllMovies();
    const filteredMovies = filter === 'all'
        ? all
        : all.filter(m => m.genre.some(g => g.toLowerCase() === filter.toLowerCase()));
    
    container.innerHTML = filteredMovies.map(movie => createMovieCard(movie)).join('');
}

function createMovieCard(movie) {
    const sentiment = AIPredictor.analyzeSentiment(movie);
    
    return `
        <div class="movie-card" onclick="openMovieModal(${movie.id})">
            <div class="movie-poster">
                <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
                <div class="movie-rating">
                    <i class="fas fa-star"></i> ${movie.rating}
                </div>
                <div class="movie-buzz">
                    <div class="buzz-meter">
                        <span>${sentiment.emoji}</span>
                        <div class="buzz-bar">
                            <div class="buzz-fill ${sentiment.color}" style="width: ${movie.buzz.score}%"></div>
                        </div>
                        <span>${movie.buzz.score}%</span>
                    </div>
                    <small>${movie.buzz.prediction}</small>
                </div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span>${movie.releaseDate}</span>
                    <span>${movie.genre[0]}</span>
                </div>
            </div>
        </div>
    `;
}

function filterMovies(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderAllMovies(filter);
}

// Buzz Predictions
function renderBuzzPredictions() {
    const container = document.getElementById('buzzPredictions');
    const topBuzzMovies = [...movies].sort((a, b) => b.buzz.score - a.buzz.score).slice(0, 4);
    
    container.innerHTML = topBuzzMovies.map(movie => {
        const sentiment = AIPredictor.analyzeSentiment(movie);
        const boxOffice = AIPredictor.predictBoxOffice(movie);
        const confidence = AIPredictor.getConfidence(movie);
        
        return `
            <div class="buzz-card" onclick="openMovieModal(${movie.id})">
                <div class="buzz-poster">
                    <img src="${movie.poster}" alt="${movie.title}">
                </div>
                <div class="buzz-details">
                    <h3 class="buzz-title">${movie.title}</h3>
                    <div class="buzz-prediction">
                        <span class="prediction-badge ${movie.buzz.score >= 80 ? 'hit' : movie.buzz.score >= 60 ? 'average' : 'risky'}">
                            ${movie.buzz.prediction}
                        </span>
                        <span class="sentiment-emoji">${sentiment.emoji}</span>
                    </div>
                    <p style="font-size: 13px; color: var(--text-secondary);">
                        AI Predicted Box Office: <strong style="color: var(--secondary)">${boxOffice}</strong>
                    </p>
                    <div class="buzz-stats">
                        <div class="buzz-stat">
                            <div class="buzz-stat-value">${movie.buzz.youtubeViews}</div>
                            <div class="buzz-stat-label">YT Views</div>
                        </div>
                        <div class="buzz-stat">
                            <div class="buzz-stat-value">${confidence}%</div>
                            <div class="buzz-stat-label">AI Confidence</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Trending Songs
function renderTrendingSongs() {
    const container = document.getElementById('songsList');
    container.innerHTML = trendingSongs.map((song, index) => `
        <div class="song-item" onclick="playSong(${song.id})">
            <span class="song-rank ${index < 3 ? 'top-3' : ''}">${index + 1}</span>
            <div class="song-thumbnail">
                <img src="${song.thumbnail}" alt="${song.title}" loading="lazy">
            </div>
            <div class="song-details">
                <h4 class="song-title">${song.title}</h4>
                <span class="song-artist">${song.artist}</span>
                <span class="song-movie">From: ${song.movie}</span>
            </div>
            <div class="song-stats">
                <span><i class="fas fa-play"></i> ${song.plays}</span>
                <span><i class="fas fa-heart"></i> ${song.likes}</span>
            </div>
            <button class="song-play-btn">
                <i class="fas fa-play"></i>
            </button>
        </div>
    `).join('');
}

// Song Player
function playSong(songId) {
    const song = trendingSongs.find(s => s.id === songId);
    if (!song) return;

    currentSong = song;
    isPlaying = true;

    const player = document.getElementById('songPlayer');
    player.classList.add('active');

    document.getElementById('playerThumb').src = song.thumbnail;
    document.getElementById('playerTitle').textContent = song.title;
    document.getElementById('playerArtist').textContent = `${song.artist} • ${song.movie}`;

    const playBtn = document.getElementById('playBtn');
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playBtn.onclick = togglePlay;

    // Simulate progress
    animateProgress();
}

function togglePlay() {
    isPlaying = !isPlaying;
    const playBtn = document.getElementById('playBtn');
    playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

function animateProgress() {
    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    
    const interval = setInterval(() => {
        if (!isPlaying) return;
        progress += 0.5;
        if (progress >= 100) progress = 0;
        progressFill.style.width = `${progress}%`;
    }, 500);
}

// Trending Movies
function renderTrendingMovies() {
    const container = document.getElementById('trendingMoviesGrid');
    const trendingMoviesList = [...movies]
        .sort((a, b) => b.buzz.score - a.buzz.score)
        .slice(0, 6);
    
    container.innerHTML = trendingMoviesList.map((movie, index) => `
        <div class="trending-movie-card" onclick="openMovieModal(${movie.id})">
            <div class="trending-movie-banner" style="background-image: url('${movie.banner}')">
                <span class="trending-rank">#${index + 1}</span>
            </div>
            <div class="trending-movie-info">
                <h3 class="trending-movie-title">${movie.title}</h3>
                <div class="trending-movie-stats">
                    <span><i class="fas fa-fire"></i> ${movie.buzz.score}% buzz</span>
                </div>
            </div>
        </div>
    `).join('');
}

// News
function renderNews() {
    const container = document.getElementById('newsMain');
    container.innerHTML = newsArticles.map((article, index) => `
        <article class="news-card ${index === 0 ? 'featured' : ''}">
            <div class="news-image" style="background-image: url('${article.image}')"></div>
            <div class="news-content">
                <span class="news-category">${article.category}</span>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-excerpt">${article.excerpt}</p>
                <div class="news-meta">
                    <span><i class="fas fa-user"></i> ${article.author} • ${article.date}</span>
                    <div class="news-reactions">
                        <span><i class="fas fa-heart"></i> ${formatNumber(article.reactions.likes)}</span>
                        <span><i class="fas fa-comment"></i> ${formatNumber(article.reactions.comments)}</span>
                        <span><i class="fas fa-share"></i> ${formatNumber(article.reactions.shares)}</span>
                    </div>
                </div>
            </div>
        </article>
    `).join('');
}

function renderHotTopics() {
    const container = document.getElementById('hotTopics');
    container.innerHTML = hotTopics.map(topic => `
        <div class="hot-topic" onclick="openChat('${topic.title.replace(/'/g, "\'")}')">
            <h4 class="hot-topic-title">${topic.title}</h4>
            <div class="hot-topic-meta">
                <span><i class="fas fa-comment"></i> ${topic.mentions} mentions</span>
                <span><i class="fas fa-arrow-${topic.trend === 'up' ? 'up' : topic.trend === 'down' ? 'down' : 'right'}" 
                    style="color: ${topic.trend === 'up' ? '#00c853' : topic.trend === 'down' ? '#ff5252' : '#ffd700'}"></i></span>
            </div>
        </div>
    `).join('');
}

// Predictions
function renderPredictions() {
    const container = document.getElementById('predictionsGrid');
    // This will be populated by API call
    container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">Loading predictions...</p>';
}

function renderPredictionsGrid(predictions) {
    const container = document.getElementById('predictionsGrid');
    if (predictions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">No predictions available at the moment.</p>';
        return;
    }

    container.innerHTML = predictions.map(movie => `
        <div class="prediction-card">
            <div class="prediction-poster" style="background-image: url('${movie.poster}')"></div>
            <div class="prediction-content">
                <h3 class="prediction-title">${movie.title}</h3>
                <div class="prediction-meta">
                    <span><i class="fas fa-calendar"></i> ${movie.releaseDate}</span>
                    <span><i class="fas fa-globe"></i> ${movie.language}</span>
                </div>
                <div class="prediction-result">
                    <div class="hit-indicator ${movie.prediction.hit ? 'hit' : 'flop'}">
                        <i class="fas fa-${movie.prediction.hit ? 'check-circle' : 'times-circle'}"></i>
                        ${movie.prediction.hit ? 'HIT' : 'FLOP'}
                    </div>
                    <div class="prediction-stats">
                        <div class="stat">
                            <span class="stat-value">${movie.prediction.collections}M</span>
                            <span class="stat-label">Collections</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${movie.prediction.returns}%</span>
                            <span class="stat-label">Returns</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${movie.prediction.confidence}%</span>
                            <span class="stat-label">Confidence</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Chat for hot topics
function openChat(topicTitle) {
    chatTopic = topicTitle;
    document.getElementById('chatTopicTitle').textContent = topicTitle;
    const panel = document.getElementById('chatPanel');
    panel.classList.add('active');
    renderChatMessages();
    setTimeout(() => {
        document.getElementById('chatText')?.focus();
    }, 50);
}

function closeChat() {
    document.getElementById('chatPanel').classList.remove('active');
    chatTopic = null;
}

function sendChat() {
    if (!chatTopic) return;
    const nameInput = document.getElementById('chatName');
    const textInput = document.getElementById('chatText');
    const author = (nameInput.value || 'Guest').trim();
    const text = (textInput.value || '').trim();
    if (!text) return;

    if (!chatThreads[chatTopic]) chatThreads[chatTopic] = [];
    chatThreads[chatTopic].push({ author, text, ts: Date.now() });

    textInput.value = '';
    renderChatMessages();
}

function renderChatMessages() {
    const container = document.getElementById('chatMessages');
    const messages = chatThreads[chatTopic] || [];
    container.innerHTML = messages.map(msg => `
        <div class="chat-message">
            <div class="chat-meta">
                <span>${msg.author}</span>
                <span>${new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="chat-text">${escapeHtml(msg.text)}</div>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

// Movie Modal
function openMovieModal(movieId) {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;

    const modal = document.getElementById('movieModal');
    const modalBody = document.getElementById('modalBody');
    const sentiment = AIPredictor.analyzeSentiment(movie);
    const boxOffice = AIPredictor.predictBoxOffice(movie);
    const confidence = AIPredictor.getConfidence(movie);

    modalBody.innerHTML = `
        <div class="modal-banner" style="background-image: url('${movie.banner}')">
            <div class="modal-poster">
                <img src="${movie.poster}" alt="${movie.title}">
            </div>
        </div>
        <div class="modal-info">
            <h1 class="modal-title">${movie.title}</h1>
            <div class="modal-meta">
                <span><i class="fas fa-star" style="color: var(--secondary)"></i> ${movie.rating}/10</span>
                <span><i class="fas fa-clock"></i> ${movie.duration}</span>
                <span><i class="fas fa-calendar"></i> ${movie.releaseDate}</span>
                <span><i class="fas fa-film"></i> ${movie.director}</span>
            </div>
            <div class="modal-genres">
                ${movie.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
            </div>
            <p class="modal-description">${movie.description}</p>

            <!-- AI Prediction Box -->
            <div class="ai-prediction-box">
                <div class="ai-header">
                    <i class="fas fa-robot"></i>
                    <span>AI Buzz Analysis & Predictions</span>
                </div>
                <div class="prediction-grid">
                    <div class="prediction-item">
                        <div class="prediction-value ${sentiment.color}">${movie.buzz.score}%</div>
                        <div class="prediction-label">Buzz Score</div>
                    </div>
                    <div class="prediction-item">
                        <div class="prediction-value positive">${boxOffice}</div>
                        <div class="prediction-label">Box Office Prediction</div>
                    </div>
                    <div class="prediction-item">
                        <div class="prediction-value">${sentiment.emoji}</div>
                        <div class="prediction-label">${sentiment.label}</div>
                    </div>
                    <div class="prediction-item">
                        <div class="prediction-value positive">${confidence}%</div>
                        <div class="prediction-label">AI Confidence</div>
                    </div>
                </div>
                <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                    <div>
                        <div style="font-size: 24px; color: #00c853; font-weight: 700;">${movie.buzz.positiveReactions}%</div>
                        <div style="font-size: 12px; color: var(--text-muted);">Positive Reactions</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; color: #ffd700; font-weight: 700;">${movie.buzz.neutralReactions}%</div>
                        <div style="font-size: 12px; color: var(--text-muted);">Neutral</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; color: #ff5252; font-weight: 700;">${movie.buzz.negativeReactions}%</div>
                        <div style="font-size: 12px; color: var(--text-muted);">Negative</div>
                    </div>
                </div>
                <div style="margin-top: 16px; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-around; text-align: center;">
                        <div>
                            <div style="font-size: 18px; font-weight: 600;"><i class="fab fa-instagram" style="color: #e4405f;"></i> ${movie.buzz.instagramPosts}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">Instagram Posts</div>
                        </div>
                        <div>
                            <div style="font-size: 18px; font-weight: 600;"><i class="fab fa-youtube" style="color: #ff0000;"></i> ${movie.buzz.youtubeViews}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">YouTube Views</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Songs -->
            ${movie.songs.length > 0 ? `
                <div class="modal-section">
                    <h3><i class="fas fa-music"></i> Movie Soundtrack</h3>
                    <div class="modal-songs">
                        ${movie.songs.map((song, index) => `
                            <div class="modal-song" onclick="playModalSong('${song.title}', '${song.artist}', '${song.thumbnail}')">
                                <div class="modal-song-thumb">
                                    <img src="${song.thumbnail}" alt="${song.title}">
                                </div>
                                <div class="modal-song-info">
                                    <h4 class="modal-song-title">${song.title}</h4>
                                    <span class="modal-song-artist">${song.artist}</span>
                                </div>
                                <button class="song-play-btn" style="width: 40px; height: 40px; font-size: 14px;">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function playModalSong(title, artist, thumbnail) {
    currentSong = { title, artist, thumbnail };
    isPlaying = true;

    const player = document.getElementById('songPlayer');
    player.classList.add('active');

    document.getElementById('playerThumb').src = thumbnail;
    document.getElementById('playerTitle').textContent = title;
    document.getElementById('playerArtist').textContent = artist;

    const playBtn = document.getElementById('playBtn');
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playBtn.onclick = togglePlay;

    animateProgress();
}

function closeModal() {
    document.getElementById('movieModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Search
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        renderAllMovies();
        return;
    }

    const filtered = getAllMovies().filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.genre.some(g => g.toLowerCase().includes(query)) ||
        m.director.toLowerCase().includes(query)
    );

    const container = document.getElementById('allMovies');
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">No movies found matching your search.</p>';
    } else {
        container.innerHTML = filtered.map(movie => createMovieCard(movie)).join('');
    }

    // Switch to movies tab
    switchTab('movies');
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function getAllMovies() {
    return [...movies, ...classicMovies];
}

// Basic HTML escape for chat
function escapeHtml(str) {
    return str.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards after render
setTimeout(() => {
    document.querySelectorAll('.movie-card, .buzz-card, .news-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}, 100);

// Console greeting
console.log('%c🎬 CineAI - Movie Predictions & Buzz Analyzer', 'font-size: 20px; font-weight: bold; color: #e50914;');
console.log('%cPowered by AI sentiment analysis and social media buzz tracking', 'font-size: 12px; color: #888;');
