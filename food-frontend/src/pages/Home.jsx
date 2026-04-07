import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import AIRecommendations from '../components/AIRecommendations';
import VoiceSearch from '../components/VoiceSearch';
import FoodCard from '../components/FoodCard';
import MoodSelector from '../components/MoodSelector';
import FlashDeals from '../components/FlashDeals';
import DynamicOffer from '../components/DynamicOffer';
import SmartETA from '../components/SmartETA';
import SmartCombo from '../components/SmartCombo';
import WhatsAppOrder from '../components/WhatsAppOrder';
import HeroSlider from '../components/HeroSlider';

const CAT_ICONS = {
  'Pizza': '🍕', 'Burgers': '🍔', 'Biryani': '🍛', 'Sandwiches': '🥪',
  'Fast Food': '🍟', 'Street Food': '🌮', 'Snacks': '🥨', 'Rolls & Wraps': '🌯',
  'Chinese': '🍜', 'South Indian': '🥘', 'North Indian': '🍲', 'Punjabi': '🫕',
  'Gujarati': '🥗', 'Thali': '🍱', 'General': '🍽️',
  'Chicken Items': '🍗', 'Mutton Dishes': '🥩', 'Fish & Seafood': '🐟',
  'Tandoori Items': '🔥', 'Kebabs': '🍢',
  'Pure Veg': '🥦', 'Jain Food': '🌿', 'Salads': '🥗',
  'Healthy Meals': '💪', 'Diet Food': '🥑',
  'Cakes': '🎂', 'Ice Cream': '🍦', 'Sweets': '🍮', 'Shakes': '🥤',
  'Coffee': '☕', 'Tea': '🍵', 'Juices': '🧃', 'Cold Drinks': '🥤',
  'Indian Breakfast': '🌅', 'Light Breakfast': '🍞',
  'Western Breakfast': '🥞', 'Breakfast Drinks': '🥛',
  'Desserts': '🍰', 'Beverages': '🧋', 'Rolls': '🌯', 'Pasta': '🍝',
  'Breakfast': '🍳', 'Seafood': '🦐', 'Momos': '🥟', 'Soups': '🍲',
};

const CAT_GROUPS = [
  { label: '🔥 Popular', cats: ['Pizza', 'Burgers', 'Biryani', 'Chinese', 'Fast Food', 'Street Food', 'Snacks', 'Rolls & Wraps', 'Rolls', 'Sandwiches', 'South Indian', 'North Indian', 'Punjabi', 'Gujarati', 'Thali', 'General', 'Momos', 'Pasta', 'Soups'] },
  { label: '🍗 Non-Veg', cats: ['Chicken Items', 'Mutton Dishes', 'Fish & Seafood', 'Seafood', 'Tandoori Items', 'Kebabs'] },
  { label: '🥗 Veg & Healthy', cats: ['Pure Veg', 'Jain Food', 'Salads', 'Healthy Meals', 'Diet Food'] },
  { label: '🌅 Breakfast', cats: ['Indian Breakfast', 'Light Breakfast', 'Western Breakfast', 'Breakfast Drinks', 'Breakfast'] },
  { label: '🍰 Desserts & Drinks', cats: ['Cakes', 'Ice Cream', 'Sweets', 'Desserts', 'Shakes', 'Coffee', 'Tea', 'Juices', 'Cold Drinks', 'Beverages'] },
];

export default function Home() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        setLoading(true);
        const foodRes = await api.get('foods/');
        // Handle both paginated {results:[]} and plain [] responses
        const foodData = Array.isArray(foodRes.data) ? foodRes.data : (foodRes.data.results || []);
        setFoods(foodData);

        // Categories and restaurants are non-critical — don't show error if they fail
        try {
          const catRes = await api.get('categories/');
          const catsWithFood = catRes.data.filter((cat) =>
            foodData.some((food) => food.category_name === cat.name)
          );
          setCategories(catsWithFood);
        } catch (_) {}

        try {
          const restRes = await api.get('restaurants/');
          const restData = Array.isArray(restRes.data) ? restRes.data : (restRes.data.results || []);
          setRestaurants(restData.slice(0, 4));
        } catch (_) {}

      } catch (err) {
        const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
        setError(isTimeout
          ? 'Server is waking up, please wait a moment and refresh the page...'
          : 'Could not load food items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [retryCount]);

  const filtered = foods.filter((f) => {
    const matchCat = activeCategory === 'All' || f.category_name === activeCategory;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* ── HERO SLIDER ── */}
      <HeroSlider />

      {/* ── SEARCH BAR ── */}
      <div className="home-search-bar">
        <div className="home-search-inner">
          <div className="home-search-box">
            <span className="home-search-icon">🔍</span>
            <input
              placeholder="Search for food, cuisine or restaurant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/restaurants?search=${encodeURIComponent(search)}`)}
            />
            <VoiceSearch onResult={(text) => setSearch(text)} />
            <button onClick={() => navigate(`/restaurants?search=${encodeURIComponent(search)}`)}>Search</button>
          </div>
          <div className="home-stats">
            <div className="home-stat"><span className="home-stat-num">500+</span><span className="home-stat-label">Restaurants</span></div>
            <div className="home-stat"><span className="home-stat-num">30 min</span><span className="home-stat-label">Avg Delivery</span></div>
            <div className="home-stat"><span className="home-stat-num">4.5★</span><span className="home-stat-label">Avg Rating</span></div>
          </div>
        </div>
      </div>

      <div className="section">

        {/* ── DYNAMIC OFFER ── */}
        <DynamicOffer />

        {/* ── WHATSAPP ORDERING ── */}
        <WhatsAppOrder />

        {/* ── SMART COMBO BUILDER ── */}
        <SmartCombo />

        {/* ── FLASH DEALS ── */}
        <FlashDeals />

        {/* ── OFFER BANNER ── */}
        <div className="offer-banner">
          <div>
            <div className="offer-title">🎉 Get 20% off your first order!</div>
            <div className="offer-sub">Use code WELCOME20 at checkout. Valid on orders above ₹299</div>
          </div>
          <button className="offer-code">WELCOME20</button>
        </div>

        {/* ── CATEGORIES ── */}
        {categories.length > 0 && (
          <>
            <div className="section-title-line">
              <h2 className="section-title" style={{ marginBottom: 0 }}>What's on your mind?</h2>
            </div>

            {/* Group tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {CAT_GROUPS.map((g) => {
                const hasAny = g.cats.some((c) => categories.find((cat) => cat.name === c));
                if (!hasAny) return null;
                const isGroupActive = g.cats.includes(activeCategory);
                return (
                  <button
                    key={g.label}
                    onClick={() => {
                      const first = g.cats.find((c) => categories.find((cat) => cat.name === c));
                      if (first) setActiveCategory(first);
                    }}
                    style={{
                      padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.8rem',
                      background: isGroupActive ? 'var(--primary)' : 'var(--card)',
                      color: isGroupActive ? '#fff' : 'var(--text2)',
                      boxShadow: '0 1px 4px var(--shadow)',
                      transition: 'all 0.18s',
                    }}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>

            {/* Category scroll — show only current group's cats */}
            <div className="category-scroll">
              <div
                className={`cat-card ${activeCategory === 'All' ? 'active' : ''}`}
                onClick={() => setActiveCategory('All')}
              >
                <span className="cat-icon">🍽️</span>
                <span className="cat-label">All</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text3)', marginTop: -4 }}>{foods.length} items</span>
              </div>
              {categories
                .filter((cat) => {
                  // Find which group the active category belongs to
                  const activeGroup = CAT_GROUPS.find((g) => g.cats.includes(activeCategory));
                  if (!activeGroup) return true; // show all if 'All' selected
                  return activeGroup.cats.includes(cat.name);
                })
                .map((cat) => (
                  <div
                    key={cat.id}
                    className={`cat-card ${activeCategory === cat.name ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.name)}
                  >
                    <span className="cat-icon">{CAT_ICONS[cat.name] || '🍴'}</span>
                    <span className="cat-label">{cat.name}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text3)', marginTop: -4 }}>
                      {foods.filter((f) => f.category_name === cat.name).length} items
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* ── RESTAURANTS ── */}
        {restaurants.length > 0 && (
          <>
            <div className="section-title-line">
              <h2 className="section-title" style={{ marginBottom: 0 }}>Popular Restaurants</h2>
              <Link to="/restaurants" className="see-all">See all →</Link>
            </div>
            <div className="restaurant-grid" style={{ marginBottom: 40 }}>
              {restaurants.map((r) => (
                <Link key={r.id} to={`/restaurant/${r.id}`} className="restaurant-card">
                  <img
                    src={`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop&sig=${r.id}`}
                    alt={r.name} className="restaurant-img"
                  />
                  <div className="restaurant-info">
                    <div className="restaurant-name">{r.name}</div>
                    <div className="restaurant-meta">{r.cuisine}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span className="restaurant-rating">⭐ {r.avg_rating}</span>
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>🕐 {r.delivery_time}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ── FOOD GRID ── */}
        <div className="section-title-line">
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            {activeCategory === 'All' ? 'All Items' : activeCategory}
            <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text3)', marginLeft: 8 }}>
              ({filtered.length})
            </span>
          </h2>
        </div>

        {loading && <div className="loading-container"><div className="spinner" /></div>}

        {!loading && error && foods.length === 0 && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span>⚠️ {error}</span>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              style={{ background: '#991b1b', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h2>No items found</h2>
            <p>Try a different category or search term</p>
          </div>
        )}

        <div className="food-grid">
          {filtered.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>

        {/* ── AI RECOMMENDATIONS ── */}
        <AIRecommendations />

        {/* ── MOOD SELECTOR ── */}
        <MoodSelector />

        {/* ── SMART ETA ── */}
        <div style={{ marginTop: 24 }}>
          <SmartETA showBreakdown={true} />
        </div>
      </div>
    </>
  );
}
