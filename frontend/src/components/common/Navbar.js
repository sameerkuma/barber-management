import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (error) {
      return null;
    }
  })();
  const activeUser = user || storedUser;
  const dashboardPath = activeUser?.role === 'superadmin' || activeUser?.role === 'admin'
    ? '/superadmin/dashboard'
    : activeUser?.role === 'customer'
      ? '/customer/dashboard'
      : activeUser?.role === 'barber'
        ? '/barber/dashboard'
        : '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to={dashboardPath}>Barber Management</Link>
      </div>
      <div className="nav-links">
        {!user ? (
          <>
            <NavLink to="/signup">Signup</NavLink>
            <NavLink to="/login">Login</NavLink>
            <a
              href="https://www.google.com/maps/search/?api=1&query=barber+shop"
              target="_blank"
              rel="noreferrer"
            >
              Map
            </a>
          </>
        ) : (
          <>
            {(user.role === 'superadmin' || user.role === 'admin') && (
              <NavLink to="/superadmin/dashboard">Dashboard</NavLink>
            )}
            {user.role === 'barber' && (
              <NavLink to="/barber/dashboard">Dashboard</NavLink>
            )}
            {user.role === 'customer' && (
              <NavLink to="/customer/dashboard">Dashboard</NavLink>
            )}
            <a
              href="https://www.google.com/maps/search/?api=1&query=barber+shop"
              target="_blank"
              rel="noreferrer"
            >
              Map
            </a>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
