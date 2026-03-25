import { useState, useRef, useEffect, useCallback } from 'react';
import API from '../api/api';

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await API.get('notifications/');
      setNotifications(res.data);
    } catch {
      // not logged in or error — silently ignore
    }
  }, []);

  // Fetch on mount and every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = async () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      // Mark all read
      try {
        await API.post('notifications/read/');
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch {
        // ignore
      }
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="notif-bell-wrap" onClick={handleOpen}>
        <span className="notif-bell">🔔</span>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            {notifications.length > 0 && (
              <span
                className="notif-clear"
                onClick={() => setNotifications([])}
              >
                Clear all
              </span>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="notif-empty">🔕 No notifications yet</div>
          ) : (
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {notifications.map((n) => (
                <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                  <span className="notif-icon">{n.icon}</span>
                  <div>
                    <div className="notif-text">{n.text}</div>
                    <div className="notif-time">{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
