import { Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';

const COMPANY_LINKS = [
  { to: '/about', label: '🏢 About Us' },
  { to: '/blog', label: '✍️ Blog' },
  { to: '/press', label: '📰 Press' },
  { to: '/investor-relations', label: '📈 Investor Relations' },
];

const SUPPORT_LINKS = [
  { to: '/help', label: '❓ Help Center' },
  { to: '/contact', label: '📞 Contact Us' },
  { to: '/privacy-policy', label: '🔒 Privacy Policy' },
  { to: '/terms', label: '📋 Terms of Service' },
  { to: '/refund-policy', label: '💰 Refund Policy' },
];

const MORE_LINKS_LOGGED_IN = [
  { to: '/wishlist', label: '❤️ Wishlist' },
  { to: '/bill-split', label: '🧾 Bill Split' },
  { to: '/delivery', label: '🛵 Deliver' },
  { to: '/profile', label: '👤 Profile' },
  { to: '/admin/dashboard', label: '📊 Admin' },
  { to: '/loyalty', label: '🏆 Loyalty Points' },
  { to: '/badges', label: '🏅 Badges' },
  { to: '/group-order', label: '🤝 Group Order' },
  { to: '/subscription', label: '👑 Subscription' },
  { to: '/referral', label: '🎁 Refer & Earn' },
  { to: '/videos', label: '🎥 Food Reels' },
  { to: '/grocery', label: '🛒 Grocery' },
];

function Dropdown({ label, links, wide = false }) {
  const [open, setOpen] = useState(false);
  const [dropLeft, setDropLeft] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const dropWidth = wide ? 380 : 220;
      // Prevent overflow on right edge
      const left = Math.min(rect.left, window.innerWidth - dropWidth - 12);
      setDropLeft(left);
    }
    setOpen((p) => !p);
  };

  return (
    <div className="nav-dropdown-wrap" ref={ref}>
      <button className="nav-link nav-dropdown-btn" onClick={handleOpen}>
        {label} <span className="dropdown-arrow">▾</span>
      </button>
      {open && (
        <div
          className={`nav-dropdown${wide ? ' dropdown-wide' : ''}`}
          style={{ left: dropLeft }}
        >
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="nav-dropdown-item" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const { cart } = useContext(CartContext);
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close notif on route change
  useEffect(() => { setNotifOpen(false); }, [location]);

  // Fetch notifications
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchNotifs = () => api.get('notifications/').then((r) => setNotifications(r.data)).catch(() => {});
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">🍽️ FoodDelivery</Link>

        {/* Links */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/restaurants" className="nav-link">Restaurants</Link>
          <Link to="/orders" className="nav-link">Orders</Link>

          <Dropdown label="Company" links={COMPANY_LINKS} />
          <Dropdown label="Support" links={SUPPORT_LINKS} />
          {isLoggedIn && <Dropdown label="More" links={MORE_LINKS_LOGGED_IN} wide />}

          {/* Cart */}
          <Link to="/cart" className="nav-link cart-btn">
            🛒 Cart
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>

          {/* Notification Bell */}
          {isLoggedIn && (
            <div className="notif-wrap" ref={notifRef}>
              <button
                className="notif-bell-btn"
                onClick={() => setNotifOpen((p) => !p)}
                aria-label="Notifications"
              >
                🔔
                {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
              </button>

              {notifOpen && (
                <div className="notif-panel">
                  <div className="notif-panel-header">
                    🔔 Notifications
                    {unread > 0 && <span className="notif-unread-count">{unread} new</span>}
                  </div>

                  <div className="notif-panel-body">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                          <div className="notif-item-msg">{n.message}</div>
                          <div className="notif-item-time">
                            {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Link to="/orders" className="notif-panel-footer" onClick={() => setNotifOpen(false)}>
                    View All Orders →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Auth */}
          {isLoggedIn ? (
            <button onClick={logout} className="nav-link login-btn" style={{ border: 'none', cursor: 'pointer' }}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="nav-link login-btn">Login</Link>
          )}

          {/* Dark Mode Toggle */}
          <button onClick={toggle} className="theme-toggle" title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
