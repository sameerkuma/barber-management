import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

// Barber Pages
import BarberDashboard from './pages/barber/BarberDashboard';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="main-content">
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Home />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/superadmin/login" element={<Navigate to="/login" replace />} />
              <Route path="/barber/login" element={<Navigate to="/login" replace />} />
              <Route path="/customer/login" element={<Navigate to="/login" replace />} />
              <Route path="/customer/register" element={<Navigate to="/signup" replace />} />

              {/* Admin Routes */}
              <Route 
                path="/superadmin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Barber Routes */}
              <Route 
                path="/barber/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['barber']}>
                    <BarberDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Customer Routes */}
              <Route 
                path="/customer/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Simple Home component
const heroSlides = [
  {
    title: 'Sharp bookings for modern barber shops.',
    text: 'Run appointment requests, services, customers, and admin work from one calm, fast dashboard.',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1800&q=85'
  },
  {
    title: 'Every request, ready before the chair opens.',
    text: 'Keep walk-ins, scheduled cuts, service notes, and approvals moving without losing the day.',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1800&q=85'
  },
  {
    title: 'A cleaner way to manage your shop floor.',
    text: 'Give barbers and customers a simple path from booking to completed appointment.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1800&q=85'
  }
];

const testimonials = [
  {
    name: 'Aarav Mehta',
    role: 'Shop owner',
    quote: 'The request queue keeps our mornings organized. Approvals take seconds now.'
  },
  {
    name: 'Maya Kapoor',
    role: 'Regular customer',
    quote: 'Booking is simple, and I can see my appointment without calling the shop.'
  },
  {
    name: 'Daniel Ross',
    role: 'Senior barber',
    quote: 'The dashboard makes it obvious what is pending, confirmed, and already done.'
  }
];

const Home = () => {
  const { user } = useAuth();
  const dashboardPath = user?.role === 'superadmin'
    ? '/superadmin/dashboard'
    : user?.role === 'admin'
      ? '/superadmin/dashboard'
      : user?.role === 'customer'
        ? '/customer/dashboard'
        : user?.role === 'barber'
          ? '/barber/dashboard'
          : '/login';

  return (
    <div className="home-container">
      <div className="home-carousel" aria-label="Barber management highlights">
        {heroSlides.map((slide, index) => (
          <div
            className="home-hero carousel-slide"
            style={{ backgroundImage: `linear-gradient(90deg, rgba(12, 12, 12, 0.86) 0%, rgba(12, 12, 12, 0.58) 45%, rgba(12, 12, 12, 0.18) 100%), url('${slide.image}')` }}
            key={slide.title}
          >
            <div className="home-hero-copy">
              <span className="eyebrow">Barber management</span>
              <h1>{slide.title}</h1>
              <p>{slide.text}</p>
              <div className="hero-actions">
                <Link className="card-button primary-cta" to={dashboardPath}>
                  {user ? 'Open Dashboard' : 'Login'}
                </Link>
                <Link className="card-button secondary-cta" to="/signup">Signup</Link>
                <a
                  className="card-button map-button hero-map-button"
                  href="https://www.google.com/maps/search/?api=1&query=barber+shop"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Map
                </a>
              </div>
            </div>
            <div className="carousel-count">0{index + 1} / 03</div>
          </div>
        ))}
      </div>

      <div className="home-section">
        <div className="section-title">
          <span className="eyebrow">Daily flow</span>
          <h2>Everything a shop needs to stay on schedule.</h2>
        </div>
        <div className="home-features">
          <div className="feature-card">
            <span className="feature-number">01</span>
            <h3>Appointment Requests</h3>
            <p>Review new requests, approve visits, and keep every customer booking organized.</p>
          </div>
          <div className="feature-card">
            <span className="feature-number">02</span>
            <h3>Service Menu</h3>
            <p>Maintain prices, durations, and service details so customers know exactly what to book.</p>
          </div>
          <div className="feature-card">
            <span className="feature-number">03</span>
            <h3>Customer Access</h3>
            <p>Customers can sign in, book appointments, and track upcoming visits with less waiting.</p>
          </div>
        </div>
        <div className="home-links">
          <div className="home-card">
            <span className="role-label">Account</span>
            <h3>Single Login</h3>
            <p>Customers, barbers, and admins all enter through the same secure login.</p>
            <Link className="card-button" to="/login">Open</Link>
          </div>
          <div className="home-card featured-card">
            <span className="role-label">New customer</span>
            <h3>Signup</h3>
            <p>Create a customer account, book visits, and manage appointments.</p>
            <Link className="card-button" to="/signup">Open</Link>
          </div>
          <div className="home-card">
            <span className="role-label">Directions</span>
            <h3>Find Us</h3>
            <p>Open the map and get directions when you are ready to visit.</p>
            <a className="card-button" href="https://www.google.com/maps/search/?api=1&query=barber+shop" target="_blank" rel="noreferrer">Open Map</a>
          </div>
        </div>
      </div>

      <div className="testimonial-section">
        <div className="section-title">
          <span className="eyebrow">Testimonials</span>
          <h2>Built around real shop routines.</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <div className="testimonial-card" key={testimonial.name}>
              <p>"{testimonial.quote}"</p>
              <div>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
