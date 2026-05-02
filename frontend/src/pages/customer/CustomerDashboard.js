import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('book');
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadServices();
    loadAppointments();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.customer.getServices();
      if (response.services) {
        setServices(response.services);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await api.customer.getAppointments({});
      if (response.appointments) {
        setAppointments(response.appointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setBookingData({ ...bookingData, date, time: '' });
    
    if (date) {
      try {
        const response = await api.customer.getAvailableSlots(date);
        if (response.availableSlots) {
          setAvailableSlots(response.availableSlots);
        }
      } catch (error) {
        console.error('Error loading slots:', error);
      }
    }
  };

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await api.customer.bookAppointment(bookingData);
      if (response.appointment) {
        alert('Appointment booked successfully!');
        setBookingData({
          serviceId: '',
          date: '',
          time: '',
          notes: ''
        });
        setAvailableSlots([]);
        loadAppointments();
      } else {
        alert(response.message || 'Failed to book appointment');
      }
    } catch (error) {
      alert('Error booking appointment');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.customer.cancelAppointment(id);
        loadAppointments();
        alert('Appointment cancelled successfully!');
      } catch (error) {
        alert('Error cancelling appointment');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const totalUpcoming = upcomingAppointments.length;
  const totalCompleted = appointments.filter(apt => apt.status === 'completed').length;
  const totalPending = appointments.filter(apt => apt.status === 'pending').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Customer Dashboard</h1>
          <p className="dashboard-subtitle">Book services, view upcoming appointments, and manage your bookings in one place.</p>
        </div>
        <div className="header-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Services</h3>
          <p className="summary-number">{services.length}</p>
        </div>
        <div className="summary-card">
          <h3>Upcoming Appointments</h3>
          <p className="summary-number">{totalUpcoming}</p>
        </div>
        <div className="summary-card">
          <h3>Pending Bookings</h3>
          <p className="summary-number">{totalPending}</p>
        </div>
        <div className="summary-card">
          <h3>Completed Visits</h3>
          <p className="summary-number">{totalCompleted}</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          Book Appointment
        </button>
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          My Appointments
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'book' && (
          <>
            <div className="section-header">
              <h2>Book an Appointment</h2>
            </div>
            <form onSubmit={handleBookAppointment} className="booking-form">
              <div className="form-group">
                <label>Select Service</label>
                {services.length > 0 ? (
                  <div className="service-grid">
                    {services.map(service => (
                      <div
                        key={service._id}
                        className={`service-card ${bookingData.serviceId === service._id ? 'selected' : ''}`}
                        onClick={() => setBookingData({ ...bookingData, serviceId: service._id })}
                      >
                        <h4>{service.name}</h4>
                        <p>{service.description || 'A premium service to keep you looking sharp.'}</p>
                        <div className="pill">${service.price} • {service.duration} min</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="info-box">
                    No services are available right now. Please check back later.
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Select Date</label>
                <input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              {availableSlots.length > 0 && (
                <div className="form-group">
                  <label>Select Time</label>
                  <div className="time-slots">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`time-slot ${bookingData.time === slot ? 'selected' : ''}`}
                        onClick={() => setBookingData({ ...bookingData, time: slot })}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleBookingChange}
                  placeholder="Any special requests..."
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={!bookingData.serviceId || !bookingData.time}
              >
                Book Appointment
              </button>
            </form>
          </>
        )}

        {activeTab === 'appointments' && (
          <>
            <div className="section-header">
              <h2>My Appointments</h2>
            </div>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map(apt => (
                      <tr key={apt._id}>
                        <td>{apt.service?.name}</td>
                        <td>{new Date(apt.date).toLocaleDateString()}</td>
                        <td>{apt.time}</td>
                        <td>
                          <span className={`status-badge ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td>
                          {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelAppointment(apt._id)}
                              className="btn-small btn-danger"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No appointments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;