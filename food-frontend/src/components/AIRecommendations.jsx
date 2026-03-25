import { useEffect, useState } from 'react';
import api from '../api/api';
import FoodCard from './FoodCard';

const TIME_CATS = {
  breakfast: ['Indian Breakfast', 'Light Breakfast', 'Western Breakfast', 'Breakfast Drinks', 'Tea', 'Coffee'],
  lunch: ['North Indian', 'South Indian', 'Biryani', 'Thali', 'Punjabi', 'Gujarati', 'Chinese'],
  snacks: ['Snacks', 'Fast Food', 'Street Food', 'Rolls & Wraps', 'Sandwiches', 'Cold Drinks', 'Juices'],
  dinner: ['North Indian', 'Chicken Items', 'Mutton Dishes', 'Tandoori Items', 'Kebabs', 'Biryani', 'Pizza'],
};

function getTimeBasedTag() {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return 'breakfast';
  if (h >= 11 && h < 15) return 'lunch';
  if (h >= 15 && h < 18) return 'snacks';
  return 'dinner';
}

const LABELS = {
  breakfast: '🌅 Perfect for Breakfast',
  lunch: '☀️ Great Lunch Picks',
  snacks: '🍟 Evening Snack Time',
  dinner: '🌙 Dinner Recommendations',
};

export default function AIRecommendations() {
  const [recommended, setRecommended] = useState([]);
  const [tag, setTag] = useState('');

  useEffect(() => {
    const timeTag = getTimeBasedTag();
    setTag(timeTag);

    api.get('foods/')
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : (res.data.results || []);
        const targetCats = TIME_CATS[timeTag] || [];
        const filtered = all.filter((f) =>
          targetCats.includes(f.category_name) ||
          f.category_name?.toLowerCase().includes(timeTag) ||
          f.name?.toLowerCase().includes(timeTag)
        );
        const picks = filtered.length >= 2 ? filtered : all;
        const shuffled = [...picks].sort(() => Math.random() - 0.5).slice(0, 4);
        setRecommended(shuffled);
      })
      .catch(() => {});
  }, []);

  if (recommended.length === 0) return null;

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
          🤖 {LABELS[tag] || 'Recommended for You'}
        </h2>
        <span style={{
          background: 'linear-gradient(135deg, #ff5200, #ff8c00)',
          color: 'white', fontSize: '0.7rem', fontWeight: 700,
          padding: '3px 10px', borderRadius: 20, letterSpacing: 0.5,
        }}>
          AI PICK
        </span>
      </div>
      <div className="food-grid">
        {recommended.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>
    </section>
  );
}
