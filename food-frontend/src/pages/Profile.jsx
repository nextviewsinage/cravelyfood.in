import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const AVATAR_COLORS = ['#e23744','#ff5200','#7c3aed','#0ea5e9','#10b981','#f59e0b'];

export default function Profile() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [form, setForm]       = useState({ first_name: '', last_name: '', email: '' });

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    Promise.all([api.get('auth/profile/'), api.get('orders/')])
      .then(([u, o]) => {
        setUser(u.data);
        setOrders(o.data);
        setForm({ first_name: u.data.first_name || '', last_name: u.data.last_name || '', email: u.data.email || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch('auth/profile/', form);
      setUser(res.data);
      setEditing(false);
      setSaveMsg('Profile updated!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { setSaveMsg('Failed to save.'); }
    finally { setSaving(false); }
  };

  if (!isLoggedIn) return (
    <div className="empty-state">
      <div className="empty-state-icon">👤</div>
      <h2>Login to view your profile</h2>
      <p>Access your account details and order history</p>
      <Link to="/login" className="btn-primary">Login Now</Link>
    </div>
  );

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  const initials   = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '') || user?.username?.[0] || 'U').toUpperCase();
  const colorIdx   = (user?.username?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const avatarBg   = AVATAR_COLORS[colorIdx];
  const totalSpent = orders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
  const memberYear = user?.date_joined ? new Date(user.date_joined).getFullYear() : '2024';

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="profile-page">

      {/* ── HERO BANNER ── */}
      <div className="profile-banner">
        <div className="profile-banner-bg" />
        <div className="profile-banner-content">
          <div className="profile-avatar-lg" style={{ background: avatarBg }}>
            {initials}
          </div>
          <div className="profile-banner-info">
            <h1 className="profile-display-name">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </h1>
            <p className="profile-display-sub">@{user?.username} · {user?.email}</p>
          </div>
          <button className="profile-edit-btn" onClick={() => setEditing((p) => !p)}>
            {editing ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
        </div>
      </div>

      <div className="profile-body">

        {/* ── STATS ── */}
        <div className="profile-stats">
          {[
            { icon: '📦', value: orders.length, label: 'Total Orders' },
            { icon: '💰', value: `₹${totalSpent.toFixed(0)}`, label: 'Total Spent' },
            { icon: '🎉', value: memberYear, label: 'Member Since' },
            { icon: '⭐', value: orders.filter(o => o.status === 'Delivered').length, label: 'Delivered' },
          ].map((s) => (
            <div key={s.label} className="profile-stat-card">
              <span className="profile-stat-icon">{s.icon}</span>
              <span className="profile-stat-value">{s.value}</span>
              <span className="profile-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="profile-grid">

          {/* ── LEFT: Info / Edit ── */}
          <div>
            {saveMsg && (
              <div className="profile-save-msg">{saveMsg}</div>
            )}

            {editing ? (
              <div className="profile-card">
                <div className="profile-card-title">✏️ Edit Profile</div>
                <div className="profile-form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-input" value={form.first_name}
                      onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                      placeholder="First name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-input" value={form.last_name}
                      onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                      placeholder="Last name" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="Email address" />
                </div>
                <button className="checkout-btn" onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Saving...' : '✅ Save Changes'}
                </button>
              </div>
            ) : (
              <div className="profile-card">
                <div className="profile-card-title">👤 Account Details</div>
                {[
                  { label: 'Username',   value: `@${user?.username}`,              icon: '🪪' },
                  { label: 'Email',      value: user?.email || '—',                icon: '📧' },
                  { label: 'First Name', value: user?.first_name || '—',           icon: '👤' },
                  { label: 'Last Name',  value: user?.last_name  || '—',           icon: '👤' },
                  { label: 'Member Since', value: memberYear,                      icon: '📅' },
                ].map(f => (
                  <div key={f.label} className="profile-field">
                    <span className="profile-field-icon">{f.icon}</span>
                    <div className="profile-field-body">
                      <span className="profile-label">{f.label}</span>
                      <span className="profile-value">{f.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Quick Actions ── */}
            <div className="profile-card" style={{ marginTop: 16 }}>
              <div className="profile-card-title">⚡ Quick Actions</div>
              <div className="profile-actions">
                <Link to="/orders" className="profile-action-btn">📦 My Orders</Link>
                <Link to="/wishlist" className="profile-action-btn">❤️ Wishlist</Link>
                <Link to="/loyalty" className="profile-action-btn">🏆 Loyalty Points</Link>
                <Link to="/referral" className="profile-action-btn">🎁 Refer & Earn</Link>
                <Link to="/help" className="profile-action-btn">❓ Help Center</Link>
                <button className="profile-action-btn profile-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Recent Orders ── */}
          <div>
            <div className="profile-card">
              <div className="profile-card-title-row">
                <span className="profile-card-title">🕐 Recent Orders</span>
                <Link to="/orders" className="profile-see-all">See all →</Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="profile-empty-orders">
                  <div className="profile-empty-icon">📭</div>
                  <p>No orders yet</p>
                  <Link to="/" className="btn-primary">Order Now</Link>
                </div>
              ) : (
                recentOrders.map(order => {
                  const statusCls =
                    order.status === 'Delivered'    ? 'dd-status-delivered' :
                    order.status === 'On the way'   ? 'dd-status-onway'     :
                    order.status === 'Preparing'    ? 'dd-status-preparing' : 'dd-status-pending';
                  return (
                    <div key={order.id} className="profile-order-item">
                      <div className="profile-order-left">
                        <div className="profile-order-icon">🍽️</div>
                        <div>
                          <div className="profile-order-name">{order.food_item_name}</div>
                          <div className="profile-order-meta">
                            #{order.id} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>
                      <div className="profile-order-right">
                        <div className="profile-order-price">
                          ₹{parseFloat(order.total_price).toFixed(0)}
                        </div>
                        <span className={`dd-status-badge ${statusCls}`}>{order.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
