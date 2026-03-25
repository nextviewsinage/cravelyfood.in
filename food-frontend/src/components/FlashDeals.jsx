import { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

function Countdown({ seconds }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>{m}:{s}</span>;
}

export default function FlashDeals() {
  const [deals, setDeals] = useState([]);
  const { addToCart } = useContext(CartContext);
  const { notify } = useNotification();

  useEffect(() => {
    api.get('flash-deals/').then(r => setDeals(r.data)).catch(() => {});
    const interval = setInterval(() => {
      api.get('flash-deals/').then(r => setDeals(r.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (deals.length === 0) return null;

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>⚡ Flash Deals</h2>
        <span style={{
          background: '#ff3b30', color: 'white',
          fontSize: '0.7rem', fontWeight: 700,
          padding: '3px 10px', borderRadius: 20,
          animation: 'pulse 1.5s infinite',
        }}>LIVE</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {deals.map((deal) => (
          <div key={deal.id} style={{
            background: 'white', borderRadius: 16,
            boxShadow: '0 2px 16px rgba(255,82,0,0.15)',
            border: '2px solid #ff5200',
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ff5200, #ff8c00)',
              color: 'white', padding: '8px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{deal.discount_percent}% OFF</span>
              <div style={{ fontSize: '0.78rem' }}>
                ⏱ <Countdown seconds={deal.seconds_left} />
              </div>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{deal.food_item_detail?.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '0.88rem' }}>
                  ₹{deal.food_item_detail?.price}
                </span>
                <span style={{ color: '#ff5200', fontWeight: 800, fontSize: '1.1rem' }}>
                  ₹{deal.discounted_price}
                </span>
              </div>
              <button
                onClick={() => {
                  addToCart({ ...deal.food_item_detail, price: deal.discounted_price });
                  notify(`⚡ Flash deal added: ${deal.food_item_detail?.name}`);
                }}
                style={{
                  marginTop: 10, width: '100%',
                  background: '#ff5200', color: 'white',
                  border: 'none', borderRadius: 8,
                  padding: '8px 0', fontWeight: 700,
                  cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                + Add at Flash Price
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
