# CineAI - Movie Predictions & Buzz Analyzer

A modern, AI-powered movie discovery and prediction platform that analyzes upcoming movies from around the world using real-time data from TMDB and YouTube APIs.

## Features

### 🎬 Movie Discovery
- **Real-time Trending Movies**: Live updates from TMDB trending API
- **Upcoming Movies**: Browse upcoming releases from multiple regions
- **Classic Movies**: Top-rated movies from TMDB
- **Multi-language Support**: Movies from US, India, Korea, Japan, France, Germany, Spain, Italy, Brazil, and Mexico

### 🤖 AI Movie Predictions
- **Hit/Flop Predictions**: ML-based algorithm analyzing popularity, ratings, and buzz
- **Box Office Estimates**: Predicted collections in millions
- **ROI Calculations**: Return on investment percentages
- **Confidence Scores**: AI confidence levels for predictions
- **Global Coverage**: Predictions for movies in all languages

### 📊 Buzz Analytics
- **Social Media Metrics**: Twitter mentions, Instagram posts, YouTube views
- **Sentiment Analysis**: Positive, negative, and neutral reactions
- **Real-time Updates**: Data refreshes every 3 minutes
- **Trending Songs**: YouTube trending music videos

### 🎵 Entertainment Features
- **Music Integration**: Trending songs from YouTube
- **Interactive Chat**: Hot topic discussions
- **News Feed**: Latest movie industry news
- **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **APIs**: TMDB API, YouTube Data API
- **Styling**: Custom CSS with modern design
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Poppins)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- TMDB API Key and Bearer Token
- YouTube Data API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd movie_project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Keys**
   Create a `.env` file in the root directory:
   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   TMDB_BEARER=your_tmdb_bearer_token_here
   YT_API_KEY=your_youtube_api_key_here
   PORT=3000
   ```

4. **Get API Keys**
   - **TMDB**: Sign up at https://www.themoviedb.org/ and get API key
   - **YouTube**: Go to Google Cloud Console, enable YouTube Data API v3, and create credentials

5. **Start the server**
   ```bash
   npm start
   # or
   node server.js
   ```

6. **Open in browser**
   Navigate to `http://localhost:3000`

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/movies/trending` - Trending movies
- `GET /api/movies/classic` - Top-rated classic movies
- `GET /api/movies/predictions` - AI movie predictions
- `GET /api/videos/trending` - Trending music videos
- `GET /api/topics/trending` - Trending discussion topics
- `GET /api/news/trending` - Latest movie news

## Project Structure

```
movie_project/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js             # Frontend JavaScript
├── server.js          # Backend server
├── data.js            # Static movie data (fallback)
├── package.json       # Node.js dependencies
├── .env               # Environment variables (create this)
└── README.txt         # This file
```

## Features Overview

### Home Tab
- Hero slider with featured movies
- Upcoming movies grid
- AI buzz predictions
- Trending movies overview

### Movies Tab
- Filter by genre (Action, Drama, Comedy, etc.)
- Full movie catalog
- Search functionality

### Trending Tab
- Trending songs from YouTube
- Trending movies by buzz score

### Predictions Tab
- AI-powered movie predictions
- Hit/flop analysis
- Box office estimates
- Multi-language coverage

### News Tab
- Latest movie industry news
- Hot topics discussion
- Interactive chat system

## AI Prediction Algorithm

The prediction system uses a weighted algorithm considering:

- **Popularity Score** (40% weight): TMDB popularity metric
- **Vote Average** (40% weight): User ratings scaled to 0-10
- **Vote Count** (20% weight): Logarithmic scaling of total votes

**Hit Threshold**: Buzz score > 50
**Collections Formula**: Base collections = buzz_score × 2 (for hits) or buzz_score × 0.5 (for flops)
**Returns Formula**: ROI = 150% + (buzz_score - 50) × 2% (for hits)
**Confidence**: Min 60%, max 95% based on buzz score

## Supported Languages

- English (US/UK)
- Hindi (India)
- Telugu (India)
- Tamil (India)
- Kannada (India)
- Malayalam (India)
- Korean
- Japanese
- French
- German
- Spanish
- Italian
- Portuguese

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please respect API terms of service.

## API Usage Limits

- **TMDB**: 50 requests per second
- **YouTube**: 10,000 units per day (varies by quota)

## Troubleshooting

### Server won't start
- Check if port 3000 is available
- Verify .env file exists with correct API keys
- Run `npm install` to ensure dependencies are installed

### API errors
- Verify API keys are valid and have correct permissions
- Check internet connection
- Review API quota limits

### Movies not loading
- Check TMDB API key and bearer token
- Ensure server is running on correct port
- Check browser console for errors

## Future Enhancements

- [ ] User accounts and favorites
- [ ] Advanced ML models for better predictions
- [ ] Movie recommendations
- [ ] Social features
- [ ] Mobile app version
- [ ] Offline support

---

**Built with ❤️ for movie enthusiasts**