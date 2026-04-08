import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import BACKEND from '../config';
const FOOD_IMGS = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=250&fit=crop',
];

export default function RestaurantDetail() {
  const { id } = useParams();
  const { addToCart, cart } = useContext(CartContext);
  const { isLoggedIn } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('menu');
  const [toast, setToast] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`restaurants/${id}/`),
      api.get(`restaurants/${id}/menu/`),
      api.get(`reviews/?restaurant=${id}`),
    ]).then(([r, m, rv]) => {
      setRestaurant(r.data);
      setMenu(m.data);
      setReviews(rv.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const handleAdd = (food) => { addToCart(food); showToast(`✅ ${food.name} added!`); };

  const isInCart = (fid) => cart.some((i) => i.id === fid);

  const getImg = (food) => {
    if (food.image) return food.image.startsWith('http') ? food.image : `${BACKEND}${food.image}`;
    return FOOD_IMGS[food.id % FOOD_IMGS.length];
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { alert('Please login to submit a review'); return; }
    setSubmitting(true);
    try {
      const authApi = (await import('../api/api')).default;
      await authApi.post('reviews/', { ...reviewForm, restaurant: parseInt(id) });
      const rv = await api.get(`reviews/?restaurant=${id}`);
      setReviews(rv.data);
      setReviewForm({ rating: 5, comment: '' });
      showToast('✅ Review submitted!');
    } catch { alert('Failed to submit review. Please login first.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!restaurant) return <div className="empty-state"><h2>Restaurant not found</h2><Link to="/restaurants" className="btn-primary">Back</Link></div>;

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=60) center/cover',
        padding: '48px 32px', color: '#fff',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 8 }}>
            <Link to="/restaurants" style={{ color: '#fff', textDecoration: 'none' }}>Restaurants</Link> › {restaurant.name}
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{restaurant.name}</h1>
          <p style={{ opacity: 0.9, marginTop: 6 }}>{restaurant.cuisine}</p>
          <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
            <span style={{ background: '#48c479', padding: '4px 12px', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}>
              ⭐ {restaurant.avg_rating} ({restaurant.review_count} reviews)
            </span>
            <span>🕐 {restaurant.delivery_time}</span>
            <span>📍 {restaurant.city}</span>
            <span>💰 Min order ₹{restaurant.min_order}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 68, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', gap: 0 }}>
          {['menu', 'reviews'].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '16px 24px', border: 'none', background: 'none',
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              color: tab === t ? '#e23744' : '#888',
              borderBottom: tab === t ? '3px solid #e23744' : '3px solid transparent',
              textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div className="section">
        {/* MENU TAB */}
        {tab === 'menu' && (
          <>
            <h2 className="section-title">Menu ({menu.length} items)</h2>
            {menu.length === 0 && <p style={{ color: '#888' }}>No menu items available yet.</p>}
            <div className="food-grid">
              {menu.map((food) => (
                <div key={food.id} className="food-card">
                  <div className="food-image-wrapper">
                    <img src={getImg(food)} alt={food.name} className="food-image"
                      onError={(e) => { e.target.src = FOOD_IMGS[food.id % FOOD_IMGS.length]; }} />
                    {food.is_bestseller && <span className="food-badge">🔥 Bestseller</span>}
                    <div className="food-veg-badge">
                      <div className="food-veg-dot" style={{ background: food.is_veg ? '#48c479' : '#e23744' }} />
                    </div>
                  </div>
                  <div className="food-info">
                    <div className="food-name">{food.name}</div>
                    <div className="food-description">{food.description || 'Fresh & delicious'}</div>
                    <div className="food-footer">
                      <span className="food-price">₹{food.price}</span>
                      <button className={`add-btn ${isInCart(food.id) ? 'added' : ''}`} onClick={() => handleAdd(food)}>
                        {isInCart(food.id) ? '✓ Added' : '+ Add'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* REVIEWS TAB */}
        {tab === 'reviews' && (
          <>
            <h2 className="section-title">Reviews ({reviews.length})</h2>

            {/* Submit Review */}
            {isLoggedIn && (
              <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Write a Review</h3>
                <form onSubmit={submitReview}>
                  <div style={{ marginBottom: 14 }}>
                    <label className="form-label">Rating</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                          style={{
                            fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer',
                            opacity: s <= reviewForm.rating ? 1 : 0.3,
                          }}>⭐</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea className="form-input" rows={3} placeholder="Share your experience..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      style={{ resize: 'vertical' }} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ margin: 0 }} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {reviews.length === 0 && <p style={{ color: '#888' }}>No reviews yet. Be the first!</p>}

            {reviews.map((rv) => (
              <div key={rv.id} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', marginBottom: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{rv.username}</span>
                    <span style={{ marginLeft: 10, color: '#f5a623', fontWeight: 700 }}>{'⭐'.repeat(rv.rating)}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#aaa' }}>
                    {new Date(rv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {rv.comment && <p style={{ marginTop: 8, color: '#555', fontSize: '0.9rem', lineHeight: 1.5 }}>{rv.comment}</p>}
              </div>
            ))}
          </>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
