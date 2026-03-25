import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/api';

export default function WishlistButton({ foodId, restaurantId, style = {} }) {
  const { isLoggedIn } = useAuth();
  const { notify } = useNotification();
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get('wishlist/').then((r) => {
      const found = r.data.some((w) =>
        (foodId && w.food_item === foodId) ||
        (restaurantId && w.restaurant === restaurantId)
      );
      setWishlisted(found);
    }).catch(() => {});
  }, [isLoggedIn, foodId, restaurantId]);

  const toggle = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) { notify('Login to save to wishlist', 'info'); return; }
    try {
      const res = await api.post('wishlist/toggle/', {
        food_item: foodId || null,
        restaurant: restaurantId || null,
      });
      setWishlisted(res.data.wishlisted);
      notify(res.data.wishlisted ? '❤️ Added to wishlist!' : '💔 Removed from wishlist', 'info');
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      style={{
        position: 'absolute', top: 10, right: 10,
        background: 'white', border: 'none', borderRadius: '50%',
        width: 34, height: 34, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '1.1rem', transition: 'transform 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {wishlisted ? '❤️' : '🤍'}
    </button>
  );
}
