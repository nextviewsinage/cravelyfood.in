import { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

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
  const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const watchUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : video.video_url;

  return (
    <div className="reel-card">
      {/* Video / Thumbnail */}
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
          onClick={() => ytId ? setPlaying(true) : window.open(watchUrl, '_blank')}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="reel-thumb"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="reel-thumb-fallback">🎬</div>
          )}
          {/* Overlay */}
          <div className="reel-overlay">
            <div className="reel-play-btn">▶</div>
          </div>
          {/* Duration / live badge */}
          <div className="reel-live-badge">🔴 LIVE</div>
        </div>
      )}

      {/* Info */}
      <div className="reel-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 14, height: 14, borderRadius: 3, flexShrink: 0,
            border: `2px solid ${video.is_veg !== false ? '#48c479' : '#e23744'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: video.is_veg !== false ? '#48c479' : '#e23744',
            }} />
          </div>
          <div className="reel-title">{video.title}</div>
        </div>
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
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="reel-yt-link"
              >
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
  const [vegFilter, setVegFilter] = useState('Veg'); // default: Veg only

  useEffect(() => {
    const param = vegFilter === 'Veg' ? '?veg=true' : vegFilter === 'Non-Veg' ? '?veg=false' : '';
    api.get(`videos/${param}`).then(r => setVideos(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [vegFilter]);

  const handleLike = async (id) => {
    try {
      const res = await api.post(`videos/${id}/like/`);
      setVideos(prev => prev.map(v =>
        v.id === id ? { ...v, like_count: res.data.like_count, user_liked: res.data.liked } : v
      ));
    } catch {}
  };

  const FILTERS = ['All', 'Most Liked', 'Most Viewed'];
  const VEG_FILTERS = ['Veg', 'Non-Veg', 'All'];

  const sorted = [...videos].sort((a, b) => {
    if (filter === 'Most Liked')  return b.like_count - a.like_count;
    if (filter === 'Most Viewed') return b.views - a.views;
    return 0;
  });

  return (
    <div className="static-page">
      {/* Hero */}
      <div className="reel-hero">
        <div className="reel-hero-left">
          <h1 className="reel-hero-title">🎥 Food Reels</h1>
          <p className="reel-hero-sub">Watch, get inspired, and order your favourite dishes</p>
        </div>
        <span className="reel-live-pill">🔴 LIVE</span>
      </div>

      <div className="reel-wrap">
        {/* Tip banner */}
        <div className="reel-tip">
          💡 Click on a thumbnail to play the video inline. Use "Watch on YouTube" for full screen.
        </div>

        {/* Veg / Non-Veg toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {VEG_FILTERS.map(v => (
            <button
              key={v}
              onClick={() => { setVegFilter(v); setLoading(true); }}
              style={{
                padding: '7px 18px',
                borderRadius: 20,
                border: `2px solid ${vegFilter === v ? (v === 'Veg' ? '#48c479' : v === 'Non-Veg' ? '#e23744' : '#ff5200') : '#e0e0e0'}`,
                background: vegFilter === v ? (v === 'Veg' ? '#e8f5e9' : v === 'Non-Veg' ? '#fdecea' : '#fff8f5') : '#fff',
                color: vegFilter === v ? (v === 'Veg' ? '#2e7d32' : v === 'Non-Veg' ? '#c62828' : '#ff5200') : '#888',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              {v === 'Veg' ? '🟢' : v === 'Non-Veg' ? '🔴' : '🍽️'} {v}
            </button>
          ))}
        </div>

        {/* Sort filter chips */}
        <div className="reel-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rest-chip ${filter === f ? 'active' : ''}`}
            >{f}</button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-container"><div className="spinner" /></div>
        )}

        {/* Empty */}
        {!loading && videos.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <h2>No {vegFilter !== 'All' ? vegFilter : ''} videos yet</h2>
            <p>Run <code>python manage.py seed_all</code> to add sample videos</p>
          </div>
        )}

        {/* Grid */}
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
