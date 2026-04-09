import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/api';

const BACKEND = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8000'
  : (process.env.REACT_APP_API_URL || 'https://cravelyfood-in.onrender.com');

// Name-based image map — same keywords as FoodCard
const FOOD_IMAGES = {
  'pizza':           'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop',
  'burger':          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop',
  'biryani':         'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=250&fit=crop',
  'noodles':         'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=250&fit=crop',
  'hakka':           'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=250&fit=crop',
  'fried rice':      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=250&fit=crop',
  'dosa':            'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=250&fit=crop',
  'idli':            'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=250&fit=crop',
  'sambar':          'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=250&fit=crop',
  'vada':            'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=250&fit=crop',
  'momos':           'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=250&fit=crop',
  'paneer':          'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=250&fit=crop',
  'tikka':           'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=250&fit=crop',
  'sandwich':        'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=250&fit=crop',
  'roll':            'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=250&fit=crop',
  'wrap':            'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=250&fit=crop',
  'samosa':          'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop',
  'pav bhaji':       'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=250&fit=crop',
  'bhaji':           'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=250&fit=crop',
  'bhel':            'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop',
  'thali':           'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=250&fit=crop',
  'dal':             'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=250&fit=crop',
  'soup':            'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=250&fit=crop',
  'pasta':           'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&h=250&fit=crop',
  'cake':            'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop',
  'brownie':         'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop',
  'ice cream':       'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=250&fit=crop',
  'kulfi':           'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=250&fit=crop',
  'gulab jamun':     'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=250&fit=crop',
  'rasmalai':        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=250&fit=crop',
  'chai':            'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=250&fit=crop',
  'coffee':          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=250&fit=crop',
  'lassi':           'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=250&fit=crop',
  'juice':           'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=250&fit=crop',
  'fries':           'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=250&fit=crop',
  'poha':            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=250&fit=crop',
  'upma':            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=250&fit=crop',
  'bread':           'https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=400&h=250&fit=crop',
};

const CAT_IMAGES = {
  'Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop',
  'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop',
  'Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=250&fit=crop',
  'South Indian': 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=250&fit=crop',
  'Chinese': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=250&fit=crop',
  'Snacks': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop',
  'Desserts': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop',
  'Beverages': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=250&fit=crop',
};

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop';

function getFoodImage(food) {
  // 1. Use backend image if available
  if (food?.image) {
    return food.image.startsWith('http') ? food.image : `${BACKEND}${food.image}`;
  }
  const name = (food?.name || '').toLowerCase();
  // 2. Match by name keywords
  for (const [kw, url] of Object.entries(FOOD_IMAGES)) {
    if (name.includes(kw)) return url;
  }
  // 3. Match by category
  if (food?.category_name && CAT_IMAGES[food.category_name]) {
    return CAT_IMAGES[food.category_name];
  }
  return DEFAULT_IMG;
}

export default function Wishlist() {
  const { isLoggedIn } = useAuth();
  const { notify } = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    api.get('wishlist/')
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const remove = async (id, name) => {
    await api.delete(`wishlist/${id}/`);
    setItems((prev) => prev.filter((i) => i.id !== id));
    notify(`💔 ${name} removed from wishlist`, 'info');
  };

  if (!isLoggedIn) return (
    <div className="empty-state">
      <div className="empty-state-icon">❤️</div>
      <h2>Login to see your wishlist</h2>
      <Link to="/login" className="btn-primary">Login Now</Link>
    </div>
  );

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  if (items.length === 0) return (
    <div className="static-page">
      <div className="static-hero">
        <h1>❤️ My Wishlist</h1>
        <p>Your saved favourites will appear here</p>
      </div>
      <div className="empty-state" style={{ paddingTop: 60 }}>
        <div className="empty-state-icon">💔</div>
        <h2>Nothing saved yet</h2>
        <p>Tap ❤️ on any food item to save it here</p>
        <Link to="/" className="btn-primary">Browse Menu</Link>
      </div>
    </div>
  );

  return (
    <div className="static-page">
      {/* Hero */}
      <div className="static-hero">
        <h1>❤️ My Wishlist</h1>
        <p>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="wishlist-wrap">
        <div className="wishlist-grid">
          {items.map((item) => {
            const food = item.food_item_detail;
            const rest = item.restaurant_detail;
            const target = food || rest;
            if (!target) return null;

            const imgSrc = getFoodImage(food || rest);

            return (
              <div key={item.id} className="wishlist-card">
                {/* Remove button */}
                <button
                  className="wishlist-remove-btn"
                  onClick={() => remove(item.id, target.name)}
                  title="Remove from wishlist"
                >✕</button>

                {/* Image */}
                <div className="wishlist-img-wrap">
                  <img
                    src={imgSrc}
                    alt={target.name}
                    className="wishlist-img"
                    onError={(e) => { e.target.src = DEFAULT_IMG; }}
                  />
                  {food && (
                    <div className="wishlist-type-badge">🍽️ Food</div>
                  )}
                  {rest && (
                    <div className="wishlist-type-badge">🏪 Restaurant</div>
                  )}
                </div>

                {/* Info */}
                <div className="wishlist-info">
                  <div className="wishlist-name">{target.name}</div>

                  {food && (
                    <div className="wishlist-meta">
                      <span className="wishlist-price">₹{food.price}</span>
                      {food.is_veg !== undefined && (
                        <span className={`wishlist-veg-tag ${food.is_veg ? 'veg' : 'nonveg'}`}>
                          {food.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}
                        </span>
                      )}
                    </div>
                  )}

                  {rest && (
                    <div className="wishlist-meta">
                      <span className="wishlist-cuisine">{rest.cuisine}</span>
                      <span className="wishlist-eta">🕐 {rest.delivery_time}</span>
                    </div>
                  )}

                  {food && food.description && (
                    <div className="wishlist-desc">{food.description}</div>
                  )}

                  <div className="wishlist-actions">
                    {food && (
                      <Link to="/" className="wishlist-order-btn">Order Now</Link>
                    )}
                    {rest && (
                      <Link to={`/restaurant/${rest.id}`} className="wishlist-order-btn">View Menu</Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
