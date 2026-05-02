import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const BarberLogin = () => {
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
      const response = await api.barber.login(formData);
      
      if (response.token) {
        login({ 
          id: response.user.id, 
          name: response.user.name, 
          email: response.user.email, 
          role: 'barber' 
        }, response.token);
        navigate('/barber/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container barber-login-page">
      <div className="login-art-panel">
        <div className="login-art-content">
          <span className="eyebrow">Barber workspace</span>
          <h1>Manage bookings without the back-and-forth.</h1>
          <p>Keep requests, services, and daily appointments in one clean dashboard built for a busy shop floor.</p>
          <div className="login-highlights">
            <span>Live requests</span>
            <span>Service menu</span>
            <span>Daily stats</span>
          </div>
        </div>
      </div>

      <div className="login-box barber-login-box">
        <span className="eyebrow">Staff access</span>
        <h2>Welcome Back</h2>
        <p className="login-intro">Sign in to manage appointments and keep your chair schedule moving.</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BarberLogin;
