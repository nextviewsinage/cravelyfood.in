import { useNotifications } from '../context/NotificationContext';

export default function ToastStack() {
  const { toasts } = useNotifications();
  if (!toasts.length) return null;
  return (
    <div className="notif-toast-stack">
      {toasts.map(t => (
        <div key={t.id} className="notif-toast">
          <span className="notif-toast-icon">{t.icon}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
