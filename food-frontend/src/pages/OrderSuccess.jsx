import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  const isLoggedIn = !!localStorage.getItem('access_token');

  return (
    <div className="empty-state" style={{ padding: '80px 24px' }}>
      <div style={{ fontSize: '5rem', marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontSize: '1.8rem', color: '#1c1c1c', marginBottom: 8 }}>Order Placed Successfully!</h2>
      <p style={{ fontSize: '1rem', color: '#888', marginBottom: 8 }}>
        Your food is being prepared. Estimated delivery: 30-45 mins
      </p>
      <p style={{ fontSize: '0.88rem', color: '#aaa', marginBottom: 24 }}>
        You'll receive a confirmation shortly.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {isLoggedIn && (
          <Link to="/orders" className="btn-primary" style={{ background: '#1c1c1c' }}>
            Track Order
          </Link>
        )}
        <Link to="/" className="btn-primary">
          Order More Food
        </Link>
      </div>
    </div>
  );
}
