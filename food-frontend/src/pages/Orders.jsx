import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const STEPS = ['Order Placed', 'Preparing', 'On the Way', 'Delivered'];

const getStep = (status) => {
  if (status === 'Delivered') return 3;
  if (status === 'On the way') return 2;
  if (status === 'Preparing') return 1;
  return 0;
};

const statusClass = (s) => {
  if (s === 'Pending' || s === 'Confirmed') return 'status-pending';
  if (s === 'On the way' || s === 'Preparing') return 'status-on-the-way';
  if (s === 'Delivered') return 'status-delivered';
  return '';
};

export default function Orders() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = () => {
      if (!isLoggedIn) { setLoading(false); return; }
      api.get('orders/')
        .then((r) => setOrders(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  if (!isLoggedIn) return (
    <div className="empty-state">
      <div className="empty-state-icon">🔐</div>
      <h2>Login to see your orders</h2>
      <p>Track your order history and status</p>
      <Link to="/login" className="btn-primary">Login Now</Link>
    </div>
  );

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  if (orders.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon">📦</div>
      <h2>No orders yet</h2>
      <p>Your order history will appear here</p>
      <Link to="/" className="btn-primary">Order Now</Link>
    </div>
  );

  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>📦 Your Orders</h1>
        <p>Track and manage all your orders</p>
      </div>

      <div className="orders-page">
      {orders.map((order) => {
        const step = getStep(order.status);
        return (
          <div key={order.id} className="order-card">
            <div className="order-card-top">
              <div>
                <div className="order-id">Order #{order.id}</div>
                <div className="order-food">{order.food_item_name}</div>
                <div className="order-meta">
                  Qty: {order.quantity} &nbsp;•&nbsp; ₹{parseFloat(order.total_price).toFixed(2)}
                  &nbsp;•&nbsp; {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="order-meta">
                  💳 {order.payment_method} &nbsp;•&nbsp; GST: ₹{parseFloat(order.gst_amount).toFixed(2)}
                </div>
              </div>
              <div className="order-card-right">
                <span className={`order-status ${statusClass(order.status)}`}>{order.status}</span>
                {order.status !== 'Delivered' && (
                  <div className="order-live-pill">
                    <span className="order-live-dot" />
                    Live Tracking
                  </div>
                )}
                {order.status !== 'Delivered' && (
                  <button className="order-track-btn" onClick={() => navigate(`/track/${order.id}`)}>
                    🛵 Track Order
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="order-progress">
              {STEPS.map((label, i) => (
                <div key={label} className={`progress-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  <div className={`progress-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <div className="progress-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
