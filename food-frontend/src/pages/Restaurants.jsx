import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';

const REST_FALLBACKS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600&h=300&fit=crop',
];
const BACKEND = 'http://127.0.0.1:8000';
const CUISINE_IMGS = {
  burger:  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=300&fit=crop',
  pizza:   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=300&fit=crop',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=300&fit=crop',
  snack:   'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=300&fit=crop',
  chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=300&fit=crop',
  indian:  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=300&fit=crop',
};
const getRestImg = (r) => {
  if (r.image) return r.image.startsWith('http') ? r.image : `${BACKEND}${r.image}`;
  const cuisine = (r.cuisine || '').toLowerCase();
  const key = Object.keys(CUISINE_IMGS).find(k => cuisine.includes(k));
  return key ? CUISINE_IMGS[key] : REST_FALLBACKS[r.id % REST_FALLBACKS.length];
};

export default function Restaurants() {
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState(searchParams.get('search') || '');
  const [city, setCity]         = useState(searchParams.get('city') || '');
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg]     = useState('');

  const fetchRestaurants = (overrideCity) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const c = overrideCity !== undefined ? overrideCity : city;
    if (c) params.append('city', c);
    api.get(`restaurants/?${params}`)
      .then((r) => setRestaurants(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRestaurants(); }, []); // eslint-disable-line

  const detectLocation = () => {
    if (!navigator.geolocation) { setLocMsg('GPS not supported'); return; }
    setLocating(true);
    setLocMsg('Detecting your location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.address || {};
          const detectedCity = addr.city || addr.town || addr.municipality || addr.county || addr.village || '';
          if (detectedCity) {
            setCity(detectedCity);
            setLocMsg(`📍 ${detectedCity}`);
            setLoading(true);
            const cp = new URLSearchParams();
            if (search) cp.append('search', search);
            cp.append('city', detectedCity);
            try {
              const r = await api.get(`restaurants/?${cp}`);
              setRestaurants(r.data);
              if (r.data.length === 0) setLocMsg(`📍 ${detectedCity} — no restaurants yet`);
            } catch { setRestaurants([]); }
            finally { setLoading(false); }
          } else {
            setLocMsg('City not found. Type manually.');
            fetchRestaurants('');
          }
        } catch { setLocMsg('Could not detect city.'); fetchRestaurants(''); }
        finally { setLocating(false); }
      },
      () => { setLocMsg('Location denied. Type city manually.'); setLocating(false); }
    );
  };

  return (
    <div className="restaurants-page">

      {/* ── PAGE HEADER ── */}
      <div className="rest-page-header">
        <h1 className="rest-page-title">Restaurants near you</h1>
        <p className="rest-page-sub">Discover the best food &amp; drinks in your city</p>

        {/* ── SEARCH BAR ── */}
        <div className="rest-search-bar">
          <div className="rest-search-left">
            <span className="rest-search-icon">🔍</span>
            <input
              className="rest-search-input"
              placeholder="Search restaurant or cuisine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRestaurants()}
            />
          </div>
          <div className="rest-search-divider" />
          <div className="rest-search-city">
            <span className="rest-search-icon">📍</span>
            <input
              className="rest-search-input"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRestaurants()}
            />
            <button
              className="rest-locate-btn"
              onClick={detectLocation}
              disabled={locating}
              title="Detect my location"
            >
              {locating ? '⏳' : '🎯'}
            </button>
          </div>
          <button className="rest-search-btn" onClick={() => fetchRestaurants()}>
            Search
          </button>
        </div>
      </div>

      {locMsg && (
        <div className={`rest-loc-msg ${locMsg.startsWith('📍') ? 'success' : 'error'}`}>
          {locMsg}
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="rest-grid-wrap">
        {loading && <div className="loading-container"><div className="spinner" /></div>}

        {!loading && restaurants.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <h2>No restaurants found</h2>
            <p>{city ? `No restaurants in "${city}" yet.` : 'Try searching for a restaurant or cuisine.'}</p>
            <p className="rest-cities-hint">
              Try: Ahmedabad, Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Surat, Jaipur
            </p>
          </div>
        )}

        <div className="restaurant-grid">
          {restaurants.map((r) => (
            <Link key={r.id} to={`/restaurant/${r.id}`} className="restaurant-card">
              {/* Image */}
              <div className="restaurant-img-wrap">
                <img
                  src={getRestImg(r)}
                  alt={r.name}
                  className="restaurant-img"
                  onError={(e) => { e.target.src = REST_FALLBACKS[r.id % REST_FALLBACKS.length]; }}
                />
                <div className="rest-delivery-badge">🕐 {r.delivery_time}</div>
                {r.avg_rating >= 4.5 && <div className="rest-top-badge">TOP RATED</div>}
              </div>

              {/* Info */}
              <div className="restaurant-info">
                <div className="restaurant-name">{r.name}</div>
                <div className="restaurant-meta">{r.cuisine}</div>
                <div className="restaurant-city">📍 {r.city}</div>
                <div className="rest-card-footer">
                  <span className="restaurant-rating">⭐ {r.avg_rating}</span>
                  <span className="rest-min-order">Min ₹{r.min_order}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
