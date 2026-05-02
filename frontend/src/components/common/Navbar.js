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
  const dashboardPath = activeUser?.role === 'superadmin'
    ? '/superadmin/dashboard'
    : activeUser?.role === 'customer'
      ? '/customer/dashboard'
      : activeUser?.role === 'barber' || activeUser?.role === 'admin'
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
            <NavLink to="/superadmin/login">Super Admin</NavLink>
            <NavLink to="/barber/login">Barber Login</NavLink>
            <NavLink to="/customer/login">Customer Login</NavLink>
          </>
        ) : (
          <>
            {user.role === 'superadmin' && (
              <NavLink to="/superadmin/dashboard">Dashboard</NavLink>
            )}
            {(user.role === 'barber' || user.role === 'admin') && (
              <NavLink to="/barber/dashboard">Dashboard</NavLink>
            )}
            {user.role === 'customer' && (
              <NavLink to="/customer/dashboard">Dashboard</NavLink>
            )}
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
