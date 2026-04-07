import { useState, useContext } from 'react';
import api from '../api/api';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const SUGGESTIONS = ['Burger', 'Pizza', 'Biryani', 'Momos', 'Dosa', 'Paneer', 'Noodles'];

export default function SmartCombo() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { notify } = useNotification();

  const buildCombo = async (q) => {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('ai/combo/', { query: text });
      setResult(res.data);
    } catch {
      notify('Could not build combo. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addAllToCart = () => {
    if (!result?.combo) return;
    result.combo.forEach((item) => {
      addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
    });
    notify(`🎯 Combo added to cart! You saved ₹${result.savings}`);
  };

  return (
    <div style={{
      background: 'var(--card)', borderRadius: 18,
      padding: '24px', marginBottom: 32,
      boxShadow: '0 2px 16px var(--shadow)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: '1.5rem' }}>🤖</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Smart Combo Builder</h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text3)' }}>
            Tell us what you want — AI builds the perfect combo
          </p>
        </div>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16, marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buildCombo()}
          placeholder='e.g. "Burger", "Biryani", "Pizza"...'
          style={{
            flex: 1, padding: '11px 16px', borderRadius: 12,
            border: '2px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
          }}
        />
        <button
          onClick={() => buildCombo()}
          disabled={loading}
          style={{
            padding: '11px 22px', background: '#ff5200', color: 'white',
            border: 'none', borderRadius: 12, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '⏳' : '✨ Build'}
        </button>
      </div>

      {/* Quick suggestions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuery(s); buildCombo(s); }}
            style={{
              padding: '5px 14px', borderRadius: 20, border: '1.5px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text2)', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 600,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Result */}
      {result && result.found && (
        <div style={{
          background: 'linear-gradient(135deg, #fff8f0, #fff3e0)',
          borderRadius: 14, padding: '18px', border: '2px solid #ff520022',
        }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 14, color: '#ff5200' }}>
            {result.label}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            {result.combo.map((item, i) => (
              <div key={item.id} style={{
                background: 'white', borderRadius: 12, padding: '12px',
                flex: '1 1 140px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>
                  {i === 0 ? '🍽️ Main' : i === 1 ? '🍟 Side' : '🥤 Drink'}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#222' }}>{item.name}</div>
                <div style={{ color: '#ff5200', fontWeight: 800, fontSize: '0.95rem' }}>₹{item.price}</div>
                <div style={{ fontSize: '0.72rem', color: '#888' }}>
                  {item.is_veg ? '🟢 Veg' : '🔴 Non-veg'}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'white', borderRadius: 10, padding: '12px 16px',
            marginBottom: 12,
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#888' }}>
                Original: <s>₹{result.original_price}</s>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2e7d32' }}>
                Combo: ₹{result.combo_price}
              </div>
            </div>
            <div style={{
              background: '#e8f5e9', color: '#2e7d32',
              padding: '6px 14px', borderRadius: 20,
              fontWeight: 700, fontSize: '0.85rem',
            }}>
              Save ₹{result.savings} 🎉
            </div>
          </div>

          <button
            onClick={addAllToCart}
            style={{
              width: '100%', padding: '13px', background: '#ff5200',
              color: 'white', border: 'none', borderRadius: 12,
              fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
            }}
          >
            🛒 Add Combo to Cart
          </button>
        </div>
      )}

      {result && !result.found && (
        <div style={{ color: '#888', textAlign: 'center', padding: '16px 0', fontSize: '0.9rem' }}>
          😕 {result.message}. Try: Burger, Pizza, Biryani, Momos...
        </div>
      )}
    </div>
  );
}
