import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import './Register.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      await register({
        username,
        email,
        first_name,
        last_name,
        password,
        password2,
      });
      alert('✅ Registration successful! Please login now.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.username?.[0] || 
                     err.response?.data?.email?.[0] ||
                     err.response?.data?.detail ||
                     'Registration failed. Please try again.';
      setError(errMsg);
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
            {error && <div className="error-message">{error}</div>}

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
              <label htmlFor="first_name" className="form-label">First Name</label>
              <input
                id="first_name"
                type="text"
                className="form-input"
                placeholder="Enter your first name"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name" className="form-label">Last Name</label>
              <input
                id="last_name"
                type="text"
                className="form-input"
                placeholder="Enter your last name"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password2" className="form-label">Confirm Password</label>
              <input
                id="password2"
                type="password"
                className="form-input"
                placeholder="Confirm your password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? '⏳ Creating Account...' : '✨ Sign Up'}
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
