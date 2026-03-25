import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const STATUS_CLS = {
  Delivered:    'dd-status-delivered',
  Pending:      'dd-status-pending',
  Confirmed:    'dd-status-confirmed',
  Preparing:    'dd-status-preparing',
  'On the way': 'dd-status-onway',
  Cancelled:    'dd-status-cancelled',
};

export default function AdminDashboard() {
  const { isLoggedIn } = useAuth();
  const [data, setData]         = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    Promise.all([api.get('admin/dashboard/'), api.get('admin/analytics/')])
      .then(([d, a]) => { setData(d.data); setAnalytics(a.data); })
      .catch((err) => setError(err.response?.status === 403 ? 'Admin access required' : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (!isLoggedIn) return (
    <div className="empty-state">
      <div className="empty-state-icon">🔐</div>
      <h2>Admin Login Required</h2>
      <Link to="/login" className="btn-primary">Login</Link>
    </div>
  );

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  if (error) return (
    <div className="empty-state">
      <div className="empty-state-icon">🚫</div>
      <h2>{error}</h2>
      <p>Only Django superusers can access this page</p>
    </div>
  );

  const maxRevenue = Math.max(...(analytics?.daily_sales?.map((d) => d.revenue) || [1]));

  const STATS = [
    { icon: '📦', label: 'Total Orders',   value: data.total_orders,                          cls: 'orange' },
    { icon: '💰', label: 'Total Revenue',  value: `₹${data.total_revenue.toLocaleString()}`,  cls: 'green'  },
    { icon: '⏳', label: 'Pending Orders', value: data.pending_orders,                         cls: 'yellow' },
    { icon: '✅', label: 'Delivered',      value: data.delivered_orders,                       cls: 'blue'   },
    { icon: '👥', label: 'Total Users',    value: data.total_users,                            cls: 'purple' },
    { icon: '🍔', label: 'Food Items',     value: data.total_foods,                            cls: 'pink'   },
  ];

  return (
    <div className="static-page">
      {/* Hero */}
      <div className="dd-hero">
        <div>
          <h1 className="dd-hero-title">🧑‍💼 Admin Dashboard</h1>
          <p className="dd-hero-sub">Overview of your platform performance</p>
        </div>
      </div>

      <div className="admin-wrap">

        {/* ── STAT CARDS ── */}
        <div className="admin-stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="admin-stat-card">
              <div className={`admin-stat-icon-box ${s.cls}`}>{s.icon}</div>
              <div>
                <div className={`admin-stat-value ${s.cls}`}>{s.value}</div>
                <div className="admin-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── POPULAR + RECENT ── */}
        <div className="admin-panels-row">

          {/* Popular Foods */}
          <div className="admin-panel">
            <div className="admin-panel-title">🔥 Popular Foods</div>
            <div className="admin-panel-list">
              {data.popular_foods.map((f, i) => (
                <div key={f.food_item__id} className="admin-list-row">
                  <div className="admin-list-left">
                    <span className={`admin-rank ${i === 0 ? 'top' : ''}`}>{i + 1}</span>
                    <span className="admin-list-name">{f.food_item__name}</span>
                  </div>
                  <div className="admin-list-right">
                    <div className="admin-list-orders">{f.order_count} orders</div>
                    <div className="admin-list-rev">₹{parseFloat(f.revenue || 0).toFixed(0)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="admin-panel">
            <div className="admin-panel-title">🕐 Recent Orders</div>
            <div className="admin-panel-list">
              {data.recent_orders.map((o) => (
                <div key={o.id} className="admin-list-row">
                  <div className="admin-list-left" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                    <span className="admin-list-name">#{o.id} — {o.food_item_name}</span>
                    <span className="admin-list-sub">{o.customer_name}</span>
                  </div>
                  <div className="admin-list-right">
                    <div className="admin-list-price">₹{parseFloat(o.total_price).toFixed(0)}</div>
                    <span className={`dd-status-badge ${STATUS_CLS[o.status] || ''}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DAILY SALES CHART ── */}
        {analytics?.daily_sales?.length > 0 && (
          <div className="admin-panel admin-chart-panel">
            <div className="admin-panel-title">📈 Daily Sales — Last 30 Days</div>
            <div className="admin-chart">
              {analytics.daily_sales.map((d) => (
                <div key={d.date} className="admin-bar-col">
                  <div
                    className="admin-bar"
                    title={`₹${d.revenue} — ${d.orders} orders`}
                    style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 130)}px` }}
                  />
                  <div className="admin-bar-label">{d.date.slice(5)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TOP ITEMS TABLE ── */}
        {analytics?.top_items?.length > 0 && (
          <div className="admin-panel">
            <div className="admin-panel-title">📊 Top Items by Revenue</div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    {['#', 'Item', 'Orders', 'Revenue'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.top_items.map((t, i) => (
                    <tr key={t.name}>
                      <td className="admin-td-rank">{i + 1}</td>
                      <td className="admin-td-name">{t.name}</td>
                      <td className="admin-td-orders">{t.orders}</td>
                      <td className="admin-td-rev">₹{t.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
