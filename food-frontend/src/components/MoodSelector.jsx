import { useState } from 'react';
import api from '../api/api';
import FoodCard from './FoodCard';

const MOODS = [
  { key: 'happy',   emoji: '😃', label: 'Happy',   color: '#FFD700' },
  { key: 'sad',     emoji: '😢', label: 'Sad',     color: '#6B9FD4' },
  { key: 'lazy',    emoji: '🥱', label: 'Lazy',    color: '#A8D8A8' },
  { key: 'excited', emoji: '🤩', label: 'Excited', color: '#FF6B6B' },
  { key: 'hungry',  emoji: '🤤', label: 'Hungry',  color: '#FF5200' },
];

export default function MoodSelector() {
  const [selected, setSelected] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectMood = async (mood) => {
    setSelected(mood.key);
    setLoading(true);
    try {
      const res = await api.get(`ai/mood/?mood=${mood.key}`);
      setFoods(res.data.foods || []);
    } catch { setFoods([]); }
    finally { setLoading(false); }
  };

  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
        🧠 What's your mood today?
      </h2>
      <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: 16 }}>
        We'll suggest the perfect food for you
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {MOODS.map((m) => (
          <button
            key={m.key}
            onClick={() => selectMood(m)}
            style={{
              padding: '10px 20px',
              borderRadius: 30,
              border: `2px solid ${selected === m.key ? m.color : '#e8e8e8'}`,
              background: selected === m.key ? m.color + '22' : 'white',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{m.emoji}</span> {m.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#888' }}>Finding perfect food for your mood...</p>}

      {!loading && foods.length > 0 && (
        <>
          <p style={{ color: '#ff5200', fontWeight: 700, marginBottom: 12 }}>
            {MOODS.find(m => m.key === selected)?.emoji} Perfect for your mood:
          </p>
          <div className="food-grid">
            {foods.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        </>
      )}
    </section>
  );
}
