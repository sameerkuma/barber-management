import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const BarberDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    search: ''
  });
  const [summary, setSummary] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [activeTab, filters.status, filters.date]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'appointments') {
        const query = {};
        if (filters.status && filters.status !== 'all') query.status = filters.status;
        if (filters.date) query.date = filters.date;

        const response = await api.barber.getAppointments(query);
        if (response.appointments) {
          setAppointments(response.appointments);
          const pendingCount = response.appointments.filter(apt => apt.status === 'pending').length;
          const confirmedCount = response.appointments.filter(apt => apt.status === 'confirmed').length;
          const completedCount = response.appointments.filter(apt => apt.status === 'completed').length;
          const cancelledCount = response.appointments.filter(apt => apt.status === 'cancelled').length;

          setSummary({
            pending: pendingCount,
            confirmed: confirmedCount,
            completed: completedCount,
            cancelled: cancelledCount,
            total: response.appointments.length
          });
        }
      } else if (activeTab === 'services') {
        const response = await api.barber.getServices();
        if (response.services) {
          setServices(response.services);
        }
      } else if (activeTab === 'statistics') {
        const response = await api.barber.getStatistics();
        if (response.statistics) {
          setStatistics(response.statistics);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (e) => {
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.barber.createService(serviceForm);
      if (response.service) {
        alert('Service created successfully!');
        setShowServiceModal(false);
        setServiceForm({
          name: '',
          description: '',
          duration: 30,
          price: 0,
          category: ''
        });
        loadData();
      } else {
        alert(response.message || 'Failed to create service');
      }
    } catch (error) {
      alert('Error creating service');
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.barber.deleteService(id);
        loadData();
      } catch (error) {
        alert('Error deleting service');
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.barber.updateAppointment(id, { status });
      loadData();
    } catch (error) {
      alert('Error updating appointment');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ status: 'all', date: '', search: '' });
  };

  const filteredAppointments = appointments.filter(apt => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    return (
      apt.customer?.name?.toLowerCase().includes(search) ||
      apt.service?.name?.toLowerCase().includes(search) ||
      apt.notes?.toLowerCase().includes(search)
    );
  });

  const pendingAppointments = filteredAppointments.filter(apt => apt.status === 'pending');

  const getServiceImage = (name) => {
    const map = {
      Haircut: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b0?auto=format&fit=crop&w=600&q=80',
      'Beard Trim': 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
      'Wash & Style': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
      Massage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
      default: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80'
    };
    return map[name] || map.default;
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

  return (
    <div className="dashboard-container barber-dashboard">
      <div className="dashboard-header barber-dashboard-hero">
        <div>
          <span className="eyebrow">Shop workspace</span>
          <h1>Barber Dashboard</h1>
          <p className="dashboard-subtitle">A cleaner view for appointment requests, service management, and the work waiting on your chair.</p>
        </div>
        <div className="header-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Requests
        </button>
        <button 
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button 
          className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Statistics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'appointments' && (
          <>
            <div className="section-header">
              <div>
                <h2>Appointment Requests</h2>
                <p className="dashboard-subtitle">View every customer request, manage pending bookings, and approve or cancel in one place.</p>
              </div>
              <div className="filter-row">
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                />
                <input
                  type="text"
                  name="search"
                  placeholder="Search customer or service"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
                <button type="button" className="btn-secondary" onClick={clearFilters}>Clear</button>
              </div>

              <div className="summary-grid">
                <div className="summary-card">
                  <h3>All Requests</h3>
                  <p className="summary-number">{summary.total}</p>
                </div>
                <div className="summary-card">
                  <h3>Pending</h3>
                  <p className="summary-number">{summary.pending}</p>
                </div>
                <div className="summary-card">
                  <h3>Confirmed</h3>
                  <p className="summary-number">{summary.confirmed}</p>
                </div>
                <div className="summary-card">
                  <h3>Completed</h3>
                  <p className="summary-number">{summary.completed}</p>
                </div>
                <div className="summary-card">
                  <h3>Cancelled</h3>
                  <p className="summary-number">{summary.cancelled}</p>
                </div>
              </div>
            </div>
            {!loading && (
              <div className="pending-panel">
                <div className="pending-panel-header">
                  <div>
                    <span className="eyebrow">Needs action</span>
                    <h3>Pending Requests</h3>
                  </div>
                  <span className="pending-count">{pendingAppointments.length} waiting</span>
                </div>
                {pendingAppointments.length > 0 ? (
                  <div className="pending-request-grid">
                    {pendingAppointments.map(apt => (
                      <div className="pending-request-card" key={apt._id}>
                        <div className="request-cell">
                          <img
                            src={getServiceImage(apt.service?.name)}
                            alt={apt.service?.name}
                            className="request-image"
                          />
                          <div>
                            <strong>{apt.customer?.name || 'Customer'}</strong>
                            <div className="small-text">{apt.service?.name || 'Service'} - {apt.time}</div>
                          </div>
                        </div>
                        <p>{apt.notes || 'No notes added for this request.'}</p>
                        <div className="pending-card-footer">
                          <span>{new Date(apt.date).toLocaleDateString()}</span>
                          <div className="action-cell">
                            <button
                              onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                              className="btn-small btn-primary"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                              className="btn-small btn-danger"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No pending requests match the current filters.</div>
                )}
              </div>
            )}
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="table-panel">
                <div className="table-panel-header">
                  <h3>All Appointment Requests</h3>
                  <span>{filteredAppointments.length} shown</span>
                </div>
                <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Details</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map(apt => (
                        <tr key={apt._id}>
                          <td>{apt.customer?.name}</td>
                          <td>
                            <div className="request-cell">
                              <img
                                src={getServiceImage(apt.service?.name)}
                                alt={apt.service?.name}
                                className="request-image"
                              />
                              <div>
                                <strong>{apt.service?.name}</strong>
                                <div className="small-text">${apt.service?.price} - {apt.service?.duration} min</div>
                              </div>
                            </div>
                          </td>
                          <td>{apt.notes || 'No notes'}</td>
                          <td>{new Date(apt.date).toLocaleDateString()}</td>
                          <td>{apt.time}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(apt.status)}`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="action-cell">
                            {apt.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                                  className="btn-small btn-primary"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                                  className="btn-small btn-danger"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {apt.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(apt._id, 'completed')}
                                  className="btn-small btn-success"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                                  className="btn-small btn-danger"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {apt.status === 'completed' && (
                              <button
                                onClick={() => handleUpdateStatus(apt._id, 'pending')}
                                className="btn-small btn-secondary"
                              >
                                Reopen
                              </button>
                            )}
                            {apt.status === 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(apt._id, 'pending')}
                                className="btn-small btn-secondary"
                              >
                                Revert
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="7">No appointments found</td>
                    </tr>
                  )}
                </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'services' && (
          <>
            <div className="section-header">
              <h2>Services</h2>
              <button onClick={() => setShowServiceModal(true)} className="btn-primary">
                Add New Service
              </button>
            </div>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Duration (min)</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length > 0 ? (
                    services.map(service => (
                      <tr key={service._id}>
                        <td>{service.name}</td>
                        <td>{service.description}</td>
                        <td>{service.duration}</td>
                        <td>${service.price}</td>
                        <td>{service.category}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteService(service._id)}
                            className="btn-small btn-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No services found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === 'statistics' && (
          <>
            <div className="section-header">
              <h2>Statistics</h2>
            </div>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : statistics ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Appointments</h3>
                  <p className="stat-number">{statistics.totalAppointments}</p>
                </div>
                <div className="stat-card">
                  <h3>Pending</h3>
                  <p className="stat-number">{statistics.pendingAppointments}</p>
                </div>
                <div className="stat-card">
                  <h3>Confirmed</h3>
                  <p className="stat-number">{statistics.confirmedAppointments}</p>
                </div>
                <div className="stat-card">
                  <h3>Completed</h3>
                  <p className="stat-number">{statistics.completedAppointments}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Services</h3>
                  <p className="stat-number">{statistics.totalServices}</p>
                </div>
              </div>
            ) : (
              <p>No statistics available</p>
            )}
          </>
        )}
      </div>

      {showServiceModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Service</h3>
              <button onClick={() => setShowServiceModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleServiceSubmit}>
              <div className="form-group">
                <label>Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={serviceForm.name}
                  onChange={handleServiceChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={serviceForm.description}
                  onChange={handleServiceChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={serviceForm.duration}
                    onChange={handleServiceChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={serviceForm.price}
                    onChange={handleServiceChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={serviceForm.category}
                  onChange={handleServiceChange}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowServiceModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberDashboard;
