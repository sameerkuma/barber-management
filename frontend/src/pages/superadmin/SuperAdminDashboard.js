import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const SuperAdminDashboard = () => {
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tenantSearch, setTenantSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    subscriptionPlan: 'free'
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tenantsResponse, usersResponse] = await Promise.all([
        api.superAdmin.getTenants(),
        api.superAdmin.getUsers()
      ]);
      setTenants(tenantsResponse.tenants || []);
      setUsers(usersResponse.users || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setTenantSearch(e.target.value);
  };

  const handleChange = (e) => {
    const value = e.target.name === 'slug'
      ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const response = await api.superAdmin.createTenant(formData);
      if (response.tenant) {
        alert('Tenant created successfully!');
        setShowModal(false);
        setFormData({
          name: '',
          slug: '',
          email: '',
          phone: '',
          address: '',
          ownerName: '',
          ownerEmail: '',
          ownerPassword: '',
          subscriptionPlan: 'free'
        });
        fetchDashboardData();
      } else {
        setFormError(response.message || 'Failed to create tenant');
      }
    } catch (error) {
      setFormError(error.message || 'Error creating tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await api.superAdmin.deleteTenant(id);
        fetchDashboardData();
      } catch (error) {
        alert('Error deleting tenant');
      }
    }
  };

  const handleToggleActive = async (tenant) => {
    try {
      await api.superAdmin.updateTenant(tenant._id, { isActive: !tenant.isActive });
      fetchDashboardData();
    } catch (error) {
      alert('Error updating tenant');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.superAdmin.updateUserRole(userId, role);
      fetchDashboardData();
    } catch (error) {
      alert(error.message || 'Error updating user role');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeCount = tenants.filter(tenant => tenant.isActive).length;
  const inactiveCount = tenants.length - activeCount;
  const customerCount = users.filter(user => user.role === 'customer').length;
  const barberCount = users.filter(user => user.role === 'barber').length;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Super Admin Dashboard</h1>
          <p className="dashboard-subtitle">Manage tenants, track active shops, and keep your platform healthy from one clean console.</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Shops</h3>
            <p className="summary-number">{tenants.length}</p>
          </div>
          <div className="summary-card">
            <h3>Active</h3>
            <p className="summary-number">{activeCount}</p>
          </div>
          <div className="summary-card">
            <h3>Inactive</h3>
            <p className="summary-number">{inactiveCount}</p>
          </div>
          <div className="summary-card">
            <h3>Customers</h3>
            <p className="summary-number">{customerCount}</p>
          </div>
          <div className="summary-card">
            <h3>Barbers</h3>
            <p className="summary-number">{barberCount}</p>
          </div>
        </div>

        <div className="section-header">
          <div>
            <h2>Tenants Management</h2>
            <input
              type="text"
              placeholder="Search by name, owner, or email"
              value={tenantSearch}
              onChange={handleSearchChange}
              className="tenant-search"
            />
          </div>
          <button onClick={() => { setFormError(''); setShowModal(true); }} className="btn-primary">
            Add New Tenant
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Email</th>
              <th>Owner</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.filter(tenant => {
              if (!tenantSearch) return true;
              const query = tenantSearch.toLowerCase();
              return (
                tenant.name.toLowerCase().includes(query) ||
                tenant.ownerName.toLowerCase().includes(query) ||
                tenant.ownerEmail.toLowerCase().includes(query) ||
                tenant.email.toLowerCase().includes(query)
              );
            }).length > 0 ? (
              tenants.filter(tenant => {
                if (!tenantSearch) return true;
                const query = tenantSearch.toLowerCase();
                return (
                  tenant.name.toLowerCase().includes(query) ||
                  tenant.ownerName.toLowerCase().includes(query) ||
                  tenant.ownerEmail.toLowerCase().includes(query) ||
                  tenant.email.toLowerCase().includes(query)
                );
              }).map(tenant => (
                <tr key={tenant._id}>
                  <td>{tenant.name}</td>
                  <td>{tenant.slug}</td>
                  <td>{tenant.email}</td>
                  <td>{tenant.ownerName}</td>
                  <td>{tenant.subscriptionPlan}</td>
                  <td>
                    <span className={`status-badge ${tenant.isActive ? 'active' : 'inactive'}`}>
                      {tenant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(tenant)}
                      className="btn-small"
                    >
                      {tenant.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(tenant._id)}
                      className="btn-small btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No tenants found</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="section-header user-role-header">
          <div>
            <h2>User Role Management</h2>
            <p className="dashboard-subtitle">Signup creates customers by default. Only admin can upgrade a user role.</p>
          </div>
        </div>

        <div className="table-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'Not added'}</td>
                    <td>
                      <span className={`status-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <select
                        className="role-select"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        <option value="customer">Customer</option>
                        <option value="barber">Barber</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Tenant</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              {formError && <div className="error-message">{formError}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label>Shop Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Slug (URL)</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Shop Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Owner Name</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Owner Email</label>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Owner Password</label>
                  <input
                    type="password"
                    name="ownerPassword"
                    value={formData.ownerPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Subscription Plan</label>
                  <select
                    name="subscriptionPlan"
                    value={formData.subscriptionPlan}
                    onChange={handleChange}
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
