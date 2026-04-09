import { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const INSIGHT_STYLE = {
  habit:     { bg: '#fff8f0', border: '#ffcc99', icon: '🔁' },
  favourite: { bg: '#fff0f5', border: '#ffb3cc', icon: '❤️' },
  category:  { bg: '#f0f8ff', border: '#99ccff', icon: '🤩' },
  time:      { bg: '#f0fff4', border: '#99ddbb', icon: '⏰' },
};

const BACKEND = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8000'
  : (process.env.REACT_APP_API_URL || 'https://cravelyfood-in.onrender.com');

function getFoodImage(food) {
  if (food.image) return food.image.startsWith('http') ? food.image : `${BACKEND}${food.image}`;
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop';
}

function InsightChip({ insight }) {
  const style = INSIGHT_STYLE[insight.type] || INSIGHT_STYLE.time;
  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: 12,
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: '0.88rem',
      fontWeight: 600,
      color: '#333',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '1.2rem' }}>{style.icon}</span>
      {insight.message}
    </div>
  );
}

function PredictiveCard({ food }) {
  const { addToCart } = useContext(CartContext);
  const { notify } = useNotification();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(food);
    notify(`🛒 ${food.name} added!`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      width: 200,
      flexShrink: 0,
      position: 'relative',
      transition: 'transform 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Deal badge */}
      {food.deal_discount && (
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 2,
          background: '#ff5200', color: '#fff',
          fontSize: '0.7rem', fontWeight: 800,
          padding: '3px 8px', borderRadius: 8,
        }}>
          🔥 {food.deal_discount}% OFF
        </div>
      )}

      {/* Veg dot */}
      {food.is_veg !== undefined && (
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 2,
          background: '#fff', borderRadius: 4, padding: 3,
          border: `2px solid ${food.is_veg ? '#48c479' : '#e23744'}`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: food.is_veg ? '#48c479' : '#e23744',
          }} />
        </div>
      )}

      <img
        src={getFoodImage(food)}
        alt={food.name}
        style={{ width: '100%', height: 130, objectFit: 'cover' }}
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop'; }}
      />

      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {food.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 8,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {food.category_name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {food.surge_active ? (
              <>
                <span style={{ fontWeight: 800, color: '#ff5200', fontSize: '0.95rem' }}>
                  ₹{food.dynamic_price}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#aaa',
                  textDecoration: 'line-through', marginLeft: 4 }}>
                  ₹{food.price}
                </span>
              </>
            ) : (
              <span style={{ fontWeight: 800, color: '#1a1a2e', fontSize: '0.95rem' }}>
                ₹{food.price}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            style={{
              background: added ? '#48c479' : '#ff5200',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '5px 12px', fontWeight: 700, fontSize: '0.8rem',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            {added ? '✓' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PredictiveOrdering() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('ai/predictive/')
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  return (
    <section style={{ marginBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
          🧠 Predicted for You
        </h2>
        <span style={{
          background: 'linear-gradient(135deg,#6c3fff,#a855f7)',
          color: '#fff', fontSize: '0.68rem', fontWeight: 700,
          padding: '3px 10px', borderRadius: 20, letterSpacing: 0.5,
        }}>
          AI
        </span>
        {data.based_on > 0 && (
          <span style={{ fontSize: '0.75rem', color: '#aaa', marginLeft: 4 }}>
            Based on your {data.based_on} orders
          </span>
        )}
      </div>

      {/* Insight chips — horizontal scroll */}
      {data.insights?.length > 0 && (
        <div style={{
          display: 'flex', gap: 10, overflowX: 'auto',
          paddingBottom: 8, marginBottom: 16,
          scrollbarWidth: 'none',
        }}>
          {data.insights.map((ins, i) => (
            <InsightChip key={i} insight={ins} />
          ))}
        </div>
      )}

      {/* Food cards — horizontal scroll */}
      {data.suggestions?.length > 0 && (
        <div style={{
          display: 'flex', gap: 14, overflowX: 'auto',
          paddingBottom: 8, scrollbarWidth: 'none',
        }}>
          {data.suggestions.map(food => (
            <PredictiveCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </section>
  );
}
