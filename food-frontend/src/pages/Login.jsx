import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Login.css';

export default function Login() {
  const location = useLocation();
  const [tab, setTab] = useState('password'); // 'password' | 'otp'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const justRegistered = location.state?.registered;

  const getRedirect = (access) => {
    try {
      const payload = JSON.parse(atob(access.split('.')[1]));
      const role = payload.role || (payload.is_staff || payload.is_superuser ? 'admin' : 'customer');
      if (role === 'admin') return '/admin/dashboard';
      if (role === 'delivery') return '/delivery';
    } catch {}
    return '/';
  };

  // Password login
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
      navigate(getRedirect(res.data.access));
    } catch (err) {
      if (err.response?.status === 401) setError('Incorrect username or password.');
      else if (!err.response) setError('Server not reachable. Please try again later.');
      else setError(err.response?.data?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) { setError('Enter valid 10-digit phone number.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('auth/otp/send/', { phone });
      setOtpSent(true);
      setDevOtp(res.data.dev_otp || '');
    } catch (err) {
      // Even on error, if we got a response with dev_otp, show OTP screen
      if (err.response?.data?.dev_otp) {
        setOtpSent(true);
        setDevOtp(err.response.data.dev_otp);
      } else {
        setError('Could not send OTP. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { setError('Enter 6-digit OTP.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('auth/otp/verify/', { phone, otp });
      login(res.data.access, res.data.refresh);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
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

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
            {[
              { key: 'password', label: '🔐 Password' },
              { key: 'otp', label: '📱 Phone OTP' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(''); setOtpSent(false); }}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', background: 'none',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  color: tab === t.key ? 'var(--primary)' : 'var(--text3)',
                  borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
                  marginBottom: -2,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {justRegistered && (
            <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: '0.88rem' }}>
              ✅ Account created! Please login.
            </div>
          )}
          {error && <div className="error-message">🔒 {error}</div>}

          {/* Password Tab */}
          {tab === 'password' && (
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <input className="form-input" type="text" placeholder="Enter username or email"
                  value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password" style={{ paddingRight: 44 }} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', cursor: 'pointer', color: 'var(--text2)' }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--primary)', width: 15, height: 15 }} />
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
          )}

          {/* OTP Tab */}
          {tab === 'otp' && (
            <form className="login-form" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '10px 12px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, fontWeight: 600, color: 'var(--text2)' }}>+91</span>
                  <input className="form-input" type="tel" placeholder="10-digit mobile number"
                    value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10} disabled={otpSent} required style={{ flex: 1 }} />
                </div>
              </div>

              {otpSent && (
                <>
                  <div className="form-group">
                    <label className="form-label">Enter OTP</label>
                    <input className="form-input" type="text" placeholder="6-digit OTP"
                      value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6} autoFocus required
                      style={{ letterSpacing: 8, fontSize: '1.3rem', textAlign: 'center', fontWeight: 700 }} />
                  </div>
                  {devOtp && (
                    <div style={{ background: '#fff8e1', border: '1px solid #ffd54f', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.82rem', color: '#795548' }}>
                      🔧 Demo OTP: <strong>{devOtp}</strong> (SMS service not configured)
                    </div>
                  )}
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setDevOtp(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: 12 }}>
                    ← Change number
                  </button>
                </>
              )}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? '⏳ Please wait...' : otpSent ? 'Verify OTP' : 'Send OTP'}
              </button>
            </form>
          )}

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
