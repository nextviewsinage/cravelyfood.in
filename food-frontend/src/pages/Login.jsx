import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use plain axios to avoid interceptor issues on login
      const res = await api.post('auth/token/', { username, password });
      login(res.data.access, res.data.refresh);
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        (err.request ? 'Server not reachable. Make sure Django is running on port 8000.' : 'Login failed. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-box">
          <div className="login-header">
            <h1 className="login-title">🍕 Food Delivery</h1>
            <p className="login-subtitle">Welcome Back!</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            {error && <div className="error-message">❌ {error}</div>}

            <div style={{ background: '#fff8f0', border: '1px solid #ffd6a0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: '#7a4f00' }}>
              💡 Default credentials: <strong>admin</strong> / <strong>admin123</strong>
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? '⏳ Logging in...' : '🔓 Login'}
            </button>
          </form>

          <div className="login-footer">
            <p className="signup-text">
              Don't have an account? <Link to="/register" className="signup-link">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
