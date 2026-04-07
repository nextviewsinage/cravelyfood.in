import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Login.css';

export default function Login() {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const justRegistered = location.state?.registered;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('auth/token/', { username: username.trim(), password });
      login(res.data.access, res.data.refresh);
      if (rememberMe) localStorage.setItem('remember_me', 'true');
      navigate('/');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Incorrect username or password. Please try again.');
      } else if (!err.response) {
        setError('Server not reachable. Please try again later.');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-box">
          <div className="login-header">
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🍔</div>
            <h1 className="login-title">Cravely</h1>
            <p className="login-subtitle">Welcome back! Please login to continue.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            {justRegistered && (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: '0.88rem' }}>
                ✅ Account created! Please login.
              </div>
            )}
            {error && (
              <div className="error-message">
                🔒 {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username" className="form-label">Username or Email</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: 0,
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', cursor: 'pointer', color: 'var(--text2)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', width: 15, height: 15 }}
                />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.88rem', color: 'var(--primary)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? '⏳ Logging in...' : 'Login'}
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
