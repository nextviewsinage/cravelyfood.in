import { useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';

const QUICK_FOODS = [
  'Masala Dosa', 'Paneer Tikka', 'Veg Biryani', 'Idli Sambar',
  'Margherita Pizza', 'Veg Burger', 'Momos', 'Dal Makhani',
  'Pav Bhaji', 'Gulab Jamun', 'Mango Lassi', 'French Fries',
];

function NutritionBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        fontSize: '0.85rem', fontWeight: 600, marginBottom: 5 }}>
        <span>{label}</span>
        <span style={{ color }}>{value}g</span>
      </div>
      <div style={{ background: '#f0f0f0', borderRadius: 8, height: 10, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color, borderRadius: 8,
          transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
}

function NutritionCard({ data }) {
  const { nutrition, tags, recommendation } = data;
  const n = nutrition;

  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
      overflow: 'hidden', maxWidth: 520, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#1a1a2e,#16213e)',
        padding: '20px 24px', color: '#fff',
      }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 4 }}>
          🍽️ Nutrition Facts
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.3rem' }}>{n.name}</div>
        <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: 4 }}>
          Serving size: {n.serving}
        </div>
      </div>

      {/* Calorie highlight */}
      <div style={{
        background: 'linear-gradient(135deg,#ff5200,#ff8c00)',
        padding: '16px 24px', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Total Calories</div>
          <div style={{ fontWeight: 900, fontSize: '2.2rem', lineHeight: 1 }}>
            {n.calories}
          </div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>kcal per serving</div>
        </div>
        <div style={{ fontSize: '3rem' }}>🔥</div>
      </div>

      {/* Macros */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, color: '#555' }}>
          MACRONUTRIENTS
        </div>
        <NutritionBar label="💪 Protein"  value={n.protein} max={40}  color="#1565c0" />
        <NutritionBar label="🌾 Carbs"    value={n.carbs}   max={100} color="#f57c00" />
        <NutritionBar label="🧈 Fat"      value={n.fat}     max={50}  color="#c62828" />
        <NutritionBar label="🥦 Fiber"    value={n.fiber}   max={20}  color="#2e7d32" />

        {/* Macro grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          gap: 10, marginTop: 16,
        }}>
          {[
            { label: 'Protein', val: `${n.protein}g`, icon: '💪', color: '#1565c0', bg: '#e3f2fd' },
            { label: 'Carbs',   val: `${n.carbs}g`,  icon: '🌾', color: '#f57c00', bg: '#fff3e0' },
            { label: 'Fat',     val: `${n.fat}g`,    icon: '🧈', color: '#c62828', bg: '#fdecea' },
            { label: 'Fiber',   val: `${n.fiber}g`,  icon: '🥦', color: '#2e7d32', bg: '#e8f5e9' },
          ].map(m => (
            <div key={m.label} style={{
              background: m.bg, borderRadius: 12, padding: '10px 8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.3rem' }}>{m.icon}</div>
              <div style={{ fontWeight: 800, color: m.color, fontSize: '1rem' }}>{m.val}</div>
              <div style={{ fontSize: '0.68rem', color: '#888' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Diet tags */}
      {tags?.length > 0 && (
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 10, color: '#555' }}>
            DIET TAGS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tags.map((t, i) => (
              <span key={i} style={{
                background: t.bg, color: t.color,
                border: `1px solid ${t.color}33`,
                borderRadius: 20, padding: '5px 12px',
                fontSize: '0.8rem', fontWeight: 700,
              }}>{t.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div style={{
          margin: '0 24px 24px',
          background: `${recommendation.color}11`,
          border: `1.5px solid ${recommendation.color}44`,
          borderRadius: 12, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: '1.5rem' }}>{recommendation.icon}</span>
          <span style={{ fontWeight: 700, color: recommendation.color, fontSize: '0.88rem' }}>
            {recommendation.text}
          </span>
        </div>
      )}
    </div>
  );
}

export default function NutritionAI() {
  const [query, setQuery]   = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const search = async (foodName) => {
    const q = (foodName || query).trim();
    if (!q) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.get(`ai/nutrition/?food=${encodeURIComponent(q)}`);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Nutrition data not found. Try another food name.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg,#1a1a2e,#16213e)',
          padding: '48px 20px 40px', textAlign: 'center', color: '#fff',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🥗</div>
          <h1 style={{ fontWeight: 900, fontSize: '2rem', margin: '0 0 8px' }}>
            Calorie & Health AI
          </h1>
          <p style={{ opacity: 0.7, fontSize: '1rem', margin: '0 0 28px' }}>
            Calories • Protein • Fat • Fiber • Diet Recommendations
          </p>

          {/* Search bar */}
          <div style={{
            display: 'flex', gap: 10, maxWidth: 480,
            margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center',
          }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="e.g. Paneer Tikka, Masala Dosa..."
              style={{
                flex: 1, minWidth: 240, padding: '13px 18px',
                borderRadius: 12, border: 'none', outline: 'none',
                fontSize: '0.95rem', background: 'rgba(255,255,255,0.12)',
                color: '#fff', backdropFilter: 'blur(8px)',
              }}
            />
            <button
              onClick={() => search()}
              disabled={loading}
              style={{
                padding: '13px 24px', borderRadius: 12, border: 'none',
                background: loading ? '#888' : 'linear-gradient(135deg,#ff5200,#ff8c00)',
                color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '⏳' : '🔍 Check'}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 16px' }}>

          {/* Quick food chips */}
          {!result && (
            <>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#888',
                textAlign: 'center', marginBottom: 12 }}>
                Quick Search
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8,
                justifyContent: 'center', marginBottom: 28 }}>
                {QUICK_FOODS.map(f => (
                  <button key={f} onClick={() => { setQuery(f); search(f); }} style={{
                    background: '#fff', border: '1.5px solid #e0e0e0',
                    borderRadius: 20, padding: '7px 14px',
                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    color: '#333', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.target.style.borderColor = '#ff5200'; e.target.style.color = '#ff5200'; }}
                    onMouseLeave={e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.color = '#333'; }}
                  >{f}</button>
                ))}
              </div>

              {/* Info cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { icon: '🔥', title: 'Calories', desc: 'Track your daily intake' },
                  { icon: '💪', title: 'Protein', desc: 'Build muscle & stay full' },
                  { icon: '🥗', title: 'Diet Tags', desc: 'Gym, Low-cal, High-fiber' },
                ].map(c => (
                  <div key={c.title} style={{
                    background: '#fff', borderRadius: 14, padding: '16px 12px',
                    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{c.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#888', marginTop: 3 }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: '#fdecea', color: '#c62828', borderRadius: 12,
              padding: '14px 18px', textAlign: 'center', fontWeight: 600,
              marginBottom: 20,
            }}>😔 {error}</div>
          )}

          {/* Result */}
          {result && <NutritionCard data={result} />}

          {/* Search again */}
          {result && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => { setResult(null); setQuery(''); }} style={{
                background: 'none', border: '2px solid #ff5200', color: '#ff5200',
                borderRadius: 10, padding: '10px 24px', fontWeight: 700,
                cursor: 'pointer', fontSize: '0.9rem',
              }}>
                🔍 Search Another Food
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
