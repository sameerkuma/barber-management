import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const getDashboardPath = (role) => {
  if (role === 'admin' || role === 'superadmin') return '/superadmin/dashboard';
  if (role === 'barber') return '/barber/dashboard';
  return '/customer/dashboard';
};

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login(formData);
      login(response.user, response.token);
      navigate(getDashboardPath(response.user.role));
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <span className="eyebrow">Role based access</span>
        <h1>One login for customers, barbers, and admins.</h1>
        <p>Your dashboard opens automatically based on your account role.</p>
        <a
          className="map-button"
          href="https://www.google.com/maps/search/?api=1&query=barber+shop"
          target="_blank"
          rel="noreferrer"
        >
          Open Map
        </a>
      </div>
      <div className="login-box auth-box">
        <span className="eyebrow">Welcome back</span>
        <h2>Login</h2>
        <p className="login-intro">Use your registered email and password. Admin login is role based too.</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="register-link">
          New here? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
