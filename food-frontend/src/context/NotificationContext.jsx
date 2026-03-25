import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 10,
        zIndex: 9999,
      }}>
        {notifications.map((n) => (
          <div key={n.id} onClick={() => dismiss(n.id)} style={{
            background: n.type === 'error' ? '#ff3b30' : n.type === 'info' ? '#007aff' : '#ff5200',
            color: 'white',
            padding: '12px 18px',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            maxWidth: 320,
            animation: 'slideIn 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span>{n.type === 'error' ? '❌' : n.type === 'info' ? 'ℹ️' : '🔔'}</span>
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
