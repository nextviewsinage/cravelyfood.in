import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const STATUS_FLOW = ['Pending', 'Confirmed', 'Preparing', 'On the way', 'Delivered'];

const STATUS_COLOR = {
  Pending:      'dd-status-pending',
  Confirmed:    'dd-status-confirmed',
  Preparing:    'dd-status-preparing',
  'On the way': 'dd-status-onway',
  Delivered:    'dd-status-delivered',
  Cancelled:    'dd-status-cancelled',
};

export default function DeliveryDashboard() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [registered, setRegistered] = useState(null);
  const [orders, setOrders]         = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [regForm, setRegForm]       = useState({ phone: '', vehicle_number: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError]     = useState('');
  const [toast, setToast]           = useState('');
  const [filter, setFilter]         = useState('All');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchOrders = useCallback(() => {
    setOrdersLoading(true);
    api.get('delivery/orders/')
      .then((r) => { setOrders(r.data); setRegistered(true); })
      .catch((err) => { if (err.response?.status === 403) setRegistered(false); })
      .finally(() => setOrdersLoading(false));
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    api.get('delivery/orders/')
      .then((r) => { setOrders(r.data); setRegistered(true); showToast('✅ Orders refreshed'); })
      .catch(() => {})
      .finally(() => setTimeout(() => setRefreshing(false), 600));
  };

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchOrders();
  }, [isLoggedIn, fetchOrders, navigate]);

  useEffect(() => {
    if (!registered) return;
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [registered, fetchOrders]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.phone) { setRegError('Phone number is required'); return; }
    setRegLoading(true); setRegError('');
    try {
      await api.post('delivery/register/', regForm);
      setRegistered(true); fetchOrders();
      showToast('✅ Registered as delivery partner!');
    } catch { setRegError('Registration failed. Please try again.'); }
    finally { setRegLoading(false); }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.post(`delivery/update/${orderId}/`, { status: newStatus });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order #${orderId} → ${newStatus}`);
    } catch { showToast('❌ Update failed'); }
  };

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter((o) => o.status === filter);

  // ── LOADING ──
  if (registered === null)
    return <div className="loading-container"><div className="spinner" /></div>;

  // ── REGISTRATION FORM ──
  if (registered === false) {
    return (
      <div className="static-page">
        <div className="static-hero">
          <h1>🛵 Become a Delivery Partner</h1>
          <p>Register once and start accepting delivery orders</p>
        </div>
        <div className="dd-reg-wrap">
          <div className="dd-reg-card">
            {regError && <div className="dd-reg-error">⚠️ {regError}</div>}
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" placeholder="Enter your 10-digit number"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Number (optional)</label>
                <input className="form-input" placeholder="e.g. GJ01AB1234"
                  value={regForm.vehicle_number}
                  onChange={(e) => setRegForm({ ...regForm, vehicle_number: e.target.value })} />
              </div>
              <div className="dd-reg-perks">
                {['📦 Accept & manage delivery orders', '🗺️ Update order status in real-time', '💰 Track your earnings'].map((b) => (
                  <div key={b} className="dd-reg-perk">{b}</div>
                ))}
              </div>
              <button type="submit" className="checkout-btn" disabled={regLoading}>
                {regLoading ? '⏳ Registering...' : '🚀 Register & Start Delivering'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──
  const activeCount    = orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const onWayCount     = orders.filter((o) => o.status === 'On the way').length;

  const FILTERS = ['All', 'Pending', 'Confirmed', 'Preparing', 'On the way', 'Delivered'];

  return (
    <div className="static-page">
      {/* Hero */}
      <div className="dd-hero">
        <div>
          <h1 className="dd-hero-title">🛵 Delivery Dashboard</h1>
          <p className="dd-hero-sub">Live orders — auto-refreshes every 15s</p>
        </div>
        <button
          className={`dd-refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <span className="dd-refresh-icon">🔄</span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="dd-wrap">

        {/* Toast */}
        {toast && <div className="dd-toast">{toast}</div>}

        {/* Stats */}
        <div className="dd-stats">
          {[
            { label: 'Active Orders',   value: activeCount,    icon: '📦', cls: 'orange' },
            { label: 'Delivered Today', value: deliveredCount, icon: '✅', cls: 'green'  },
            { label: 'On the Way',      value: onWayCount,     icon: '🛵', cls: 'blue'   },
          ].map((s) => (
            <div key={s.label} className="dd-stat-card">
              <div className="dd-stat-icon">{s.icon}</div>
              <div className={`dd-stat-num ${s.cls}`}>{s.value}</div>
              <div className="dd-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="dd-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`dd-filter-btn ${filter === f ? 'active' : ''}`}
            >
              {f} ({f === 'All' ? orders.length : orders.filter((o) => o.status === f).length})
            </button>
          ))}
        </div>

        {/* Orders */}
        {ordersLoading && orders.length === 0 ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2>No orders found</h2>
            <p>{filter === 'All' ? 'New orders will appear here automatically' : `No "${filter}" orders`}</p>
          </div>
        ) : (
          <div className="dd-orders-list">
            {filteredOrders.map((order) => {
              const next = getNextStatus(order.status);
              const statusCls = STATUS_COLOR[order.status] || '';
              return (
                <div key={order.id} className="dd-order-card">
                  <div className="dd-order-top">
                    <div className="dd-order-left">
                      <div className="dd-order-header">
                        <span className="dd-order-id">ORDER #{order.id}</span>
                        <span className={`dd-status-badge ${statusCls}`}>{order.status}</span>
                      </div>
                      <div className="dd-order-name">
                        {order.food_item_name} × {order.quantity}
                      </div>
                      <div className="dd-order-details">
                        <span>👤 {order.customer_name}</span>
                        <span>📞 {order.customer_phone}</span>
                        <span>📍 {order.customer_address}</span>
                        {order.payment_method && (
                          <span>💳 {order.payment_method} — {order.payment_status}</span>
                        )}
                      </div>
                    </div>
                    <div className="dd-order-right">
                      <div className="dd-order-price">₹{order.total_price}</div>
                      <div className="dd-order-time">
                        {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="dd-order-footer">
                    {order.status === 'Delivered' ? (
                      <span className="dd-delivered-tag">✅ Delivered successfully</span>
                    ) : next ? (
                      <button className="dd-next-btn" onClick={() => updateStatus(order.id, next)}>
                        Mark as "{next}" →
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
