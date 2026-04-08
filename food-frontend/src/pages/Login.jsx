import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Login.css';

export default function Login() {
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const justRegistered = location.state?.registered;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) { setError('Enter valid 10-digit phone number.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('auth/otp/send/', { phone });
      setOtpSent(true);
    } catch (err) {
      if (err.response?.data?.message) {
        setOtpSent(true);
      } else {
        setError('Could not send OTP. Please try again.');
      }
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { setError('Enter 6-digit OTP.'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('auth/otp/verify/', { phone, otp });
      login(res.data.access, res.data.refresh);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-box">
          <div className="login-header">
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🍔</div>
            <h1 className="login-title">Cravely</h1>
            <p className="login-subtitle">Enter your mobile number to continue</p>
          </div>

          {justRegistered && (
            <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: '0.88rem' }}>
              ✅ Account created! Please login.
            </div>
          )}
          {error && <div className="error-message">🔒 {error}</div>}

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
                  <label className="form-label">Enter OTP sent to +91{phone}</label>
                  <input className="form-input" type="text" placeholder="6-digit OTP"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6} autoFocus required
                    style={{ letterSpacing: 8, fontSize: '1.3rem', textAlign: 'center', fontWeight: 700 }} />
                </div>
                <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: 12 }}>
                  ← Change number
                </button>
              </>
            )}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? '⏳ Please wait...' : otpSent ? 'Verify OTP' : 'Send OTP'}
            </button>
          </form>

          <div className="login-footer">
            <p className="signup-text">Don't have an account? <Link to="/register" className="signup-link">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
