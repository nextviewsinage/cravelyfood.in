import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import './Register.css';

const ROLES = [
  { value: 'customer', label: '🛒 Customer', desc: 'Order food online' },
  { value: 'delivery', label: '🛵 Delivery Boy', desc: 'Deliver orders' },
];

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '', role: 'customer',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const d = err.response?.data;
      setError(
        d?.username?.[0] || d?.email?.[0] || d?.password?.[0] ||
        d?.detail || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-box">
          <div className="register-header">
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🍔</div>
            <h1 className="register-title">Cravely</h1>
            <p className="register-subtitle">Create Your Account</p>
          </div>

          <form className="register-form" onSubmit={handleRegister}>
            {error && <div className="error-message">❌ {error}</div>}

            {/* Role selector */}
            <div className="form-group">
              <label className="form-label">I am a...</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {ROLES.map((r) => (
                  <div
                    key={r.value}
                    onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${form.role === r.value ? 'var(--primary)' : '#e0e0e0'}`,
                      background: form.role === r.value ? 'var(--primary-light, #fff5f0)' : '#fff',
                      textAlign: 'center', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '1.2rem' }}>{r.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#888', marginTop: 2 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">First Name</label>
                <input className="form-input" placeholder="First name" value={form.first_name} onChange={set('first_name')} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Last Name</label>
                <input className="form-input" placeholder="Last name" value={form.last_name} onChange={set('last_name')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" placeholder="Choose a username" value={form.username} onChange={set('username')} required autoComplete="username" />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  style={{ paddingRight: 44 }}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Repeat password" value={form.password2} onChange={set('password2')} required />
            </div>

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? '⏳ Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="register-footer">
            <p className="login-text">
              Already have an account? <Link to="/login" className="login-link">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
