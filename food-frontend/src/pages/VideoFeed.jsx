import { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

// Verified Unsplash veg food images — keyed by food name keywords
const VEG_IMAGES = {
  'paneer butter masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=400&fit=crop',
  'paneer tikka':         'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&h=400&fit=crop',
  'masala dosa':          'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=400&fit=crop',
  'idli':                 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=400&fit=crop',
  'veg biryani':          'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop',
  'biryani':              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop',
  'pizza':                'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
  'fried rice':           'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop',
  'momos':                'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&h=400&fit=crop',
  'burger':               'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
  'sandwich':             'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop',
  'noodles':              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop',
  'dal':                  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop',
  'thali':                'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop',
  'samosa':               'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop',
  'default':              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
};

function getVegImage(title) {
  const t = (title || '').toLowerCase();
  for (const [key, url] of Object.entries(VEG_IMAGES)) {
    if (key !== 'default' && t.includes(key)) return url;
  }
  return VEG_IMAGES.default;
}

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function VideoCard({ video, onLike }) {
  const [playing, setPlaying] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { notify } = useNotification();
  const ytId = getYouTubeId(video.video_url);
  const watchUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : video.video_url;
  // Always use our verified veg image — no broken YouTube thumbnails
  const thumbImg = getVegImage(video.title);

  return (
    <div className="reel-card">
      {/* Video player or thumbnail */}
      {playing && ytId ? (
        <div className="reel-iframe-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            className="reel-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          className="reel-thumb-wrap"
          onClick={() => ytId ? setPlaying(true) : (watchUrl && window.open(watchUrl, '_blank'))}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={thumbImg}
            alt={video.title}
            className="reel-thumb"
          />
          <div className="reel-overlay">
            <div className="reel-play-btn">▶</div>
          </div>
          {/* Veg badge on thumbnail */}
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: '#fff', borderRadius: 4, padding: '3px 6px',
            border: '2px solid #48c479',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '0.72rem', fontWeight: 700, color: '#2e7d32',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#48c479' }} />
            VEG
          </div>
        </div>
      )}

      {/* Info */}
      <div className="reel-info">
        <div className="reel-title">{video.title}</div>
        <div className="reel-meta">
          <span>🏪 {video.restaurant_name}</span>
          {video.food_name && <span>🍽️ {video.food_name}</span>}
        </div>
        {video.description && (
          <div className="reel-desc">{video.description}</div>
        )}

        <div className="reel-footer">
          <div className="reel-actions">
            <button
              className={`reel-like-btn ${video.user_liked ? 'liked' : ''}`}
              onClick={() => onLike(video.id)}
            >
              {video.user_liked ? '❤️' : '🤍'} {video.like_count}
            </button>
            <span className="reel-views">👁 {video.views}</span>
            {ytId && (
              <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="reel-yt-link">
                ▶ Watch on YouTube
              </a>
            )}
          </div>
          {video.food_item && (
            <button
              className="reel-order-btn"
              onClick={() => {
                addToCart({ id: video.food_item, name: video.food_name, price: 0 });
                notify(`${video.food_name} added to cart!`);
              }}
            >
              + Order Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoFeed() {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('All');

  useEffect(() => {
    api.get('videos/').then(r => setVideos(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleLike = async (id) => {
    try {
      const res = await api.post(`videos/${id}/like/`);
      setVideos(prev => prev.map(v =>
        v.id === id ? { ...v, like_count: res.data.like_count, user_liked: res.data.liked } : v
      ));
    } catch {}
  };

  const FILTERS = ['All', 'Most Liked', 'Most Viewed'];
  const sorted = [...videos].sort((a, b) => {
    if (filter === 'Most Liked')  return b.like_count - a.like_count;
    if (filter === 'Most Viewed') return b.views - a.views;
    return 0;
  });

  return (
    <div className="static-page">
      <div className="reel-hero">
        <div className="reel-hero-left">
          <h1 className="reel-hero-title">🎥 Food Reels</h1>
          <p className="reel-hero-sub">Watch, get inspired, and order your favourite dishes</p>
        </div>
        <div style={{
          background: '#e8f5e9', border: '2px solid #48c479',
          borderRadius: 20, padding: '6px 16px',
          display: 'flex', alignItems: 'center', gap: 6,
          fontWeight: 700, color: '#2e7d32', fontSize: '0.9rem',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#48c479' }} />
          100% Veg
        </div>
      </div>

      <div className="reel-wrap">
        <div className="reel-tip">
          💡 Click on a thumbnail to play the video inline. Use "Watch on YouTube" for full screen.
        </div>

        {/* Sort filters only — no veg/non-veg toggle */}
        <div className="reel-filters">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rest-chip ${filter === f ? 'active' : ''}`}>{f}</button>
          ))}
        </div>

        {loading && <div className="loading-container"><div className="spinner" /></div>}

        {!loading && videos.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <h2>No videos yet</h2>
            <p>Run <code>python manage.py seed_all</code> to add sample videos</p>
          </div>
        )}

        {!loading && sorted.length > 0 && (
          <div className="reel-grid">
            {sorted.map(video => (
              <VideoCard key={video.id} video={video} onLike={handleLike} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
