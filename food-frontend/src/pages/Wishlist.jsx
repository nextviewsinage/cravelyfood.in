import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/api';

const BACKEND = 'http://127.0.0.1:8000';
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop';

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

            const imgSrc = target.image
              ? (target.image.startsWith('http') ? target.image : `${BACKEND}${target.image}`)
              : FALLBACK;

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
                    onError={(e) => { e.target.src = FALLBACK; }}
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
