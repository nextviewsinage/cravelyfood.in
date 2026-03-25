import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';

const STEPS = [
  { label: 'Order Placed', icon: '📋', desc: 'Your order has been received' },
  { label: 'Preparing', icon: '👨‍🍳', desc: 'Chef is preparing your food' },
  { label: 'On the Way', icon: '🛵', desc: 'Delivery partner is on the way' },
  { label: 'Delivered', icon: '✅', desc: 'Enjoy your meal!' },
];

const getStep = (status) => {
  if (status === 'Delivered') return 3;
  if (status === 'On the way') return 2;
  if (status === 'Preparing') return 1;
  return 0;
};

// Estimated minutes remaining per step
const ETA = { 0: 35, 1: 25, 2: 10, 3: 0 };

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = () => {
      api.get(`orders/${id}/`)
        .then((r) => setOrder(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: '2rem' }}>🛵</div>
      <p style={{ color: '#888', marginTop: 12 }}>Loading order...</p>
    </div>
  );

  if (!order) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <p style={{ color: '#888' }}>Order not found.</p>
      <Link to="/orders" style={{ color: '#ff5200' }}>← Back to Orders</Link>
    </div>
  );

  const step = getStep(order.status);
  const eta = ETA[step];

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ff5200, #ff8c00)',
        borderRadius: 16,
        padding: '28px 24px',
        color: 'white',
        marginBottom: 24,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem' }}>{STEPS[step].icon}</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 8 }}>{STEPS[step].label}</h2>
        <p style={{ opacity: 0.9, marginTop: 4 }}>{STEPS[step].desc}</p>
        {eta > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 30,
            padding: '6px 20px',
            display: 'inline-block',
            marginTop: 12,
            fontWeight: 700,
            fontSize: '0.95rem',
          }}>
            ⏱ ~{eta} min remaining
          </div>
        )}
        {/* Live pulse */}
        {step < 3 && (
          <div style={{ marginTop: 10, fontSize: '0.75rem', opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            Auto-refreshing every 15s
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        {STEPS.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: i <= step ? '#ff5200' : '#f0f0f0',
                color: i <= step ? 'white' : '#aaa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: i <= step ? '1.1rem' : '0.85rem',
                fontWeight: 700,
                transition: 'all 0.3s',
                flexShrink: 0,
              }}>
                {i < step ? '✓' : s.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 2, height: 36,
                  background: i < step ? '#ff5200' : '#f0f0f0',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
            <div style={{ paddingTop: 8, paddingBottom: i < STEPS.length - 1 ? 0 : 0 }}>
              <div style={{ fontWeight: 700, color: i <= step ? '#222' : '#aaa', fontSize: '0.95rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 2 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Info */}
      <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>Order Details</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#555', marginBottom: 6 }}>
          <span>Order ID</span><span style={{ fontWeight: 600 }}>#{order.id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#555', marginBottom: 6 }}>
          <span>Item</span><span style={{ fontWeight: 600 }}>{order.food_item_name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#555', marginBottom: 6 }}>
          <span>Total</span><span style={{ fontWeight: 600, color: '#ff5200' }}>₹{parseFloat(order.total_price).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#555' }}>
          <span>Payment</span><span style={{ fontWeight: 600 }}>{order.payment_method}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/orders" style={{ color: '#ff5200', fontSize: '0.9rem', textDecoration: 'none' }}>← All Orders</Link>
      </div>
    </div>
  );
}
