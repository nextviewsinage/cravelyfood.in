import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('auth/password-reset/', { email });
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-box">
          <div className="login-header">
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔑</div>
            <h1 className="login-title">Forgot Password?</h1>
            <p className="login-subtitle">Enter your email and we'll send reset instructions.</p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📧</div>
              <p style={{ color: '#065f46', fontWeight: 600, marginBottom: 8 }}>Check your email!</p>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>
                If an account exists for <strong>{email}</strong>, you'll receive reset instructions shortly.
              </p>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              {error && <div className="error-message">❌ {error}</div>}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? '⏳ Sending...' : 'Send Reset Link'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/login" style={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none' }}>
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
