const API_BASE_URL = 'http://localhost:8081/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('Content-Type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.message || response.statusText || 'Something went wrong');
  }

  return data;
};

export const api = {
  auth: {
    login: (credentials) => fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(parseResponse),

    signup: (data) => fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(parseResponse),
  },

  superAdmin: {
    login: (credentials) => fetch(`${API_BASE_URL}/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(parseResponse),

    getTenants: () => fetch(`${API_BASE_URL}/superadmin/tenants`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(parseResponse),

    createTenant: (data) => fetch(`${API_BASE_URL}/superadmin/tenants`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(parseResponse),

    updateTenant: (id, data) => fetch(`${API_BASE_URL}/superadmin/tenants/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(parseResponse),

    deleteTenant: (id) => fetch(`${API_BASE_URL}/superadmin/tenants/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(parseResponse),

    getUsers: () => fetch(`${API_BASE_URL}/superadmin/users`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(parseResponse),

    updateUserRole: (id, role) => fetch(`${API_BASE_URL}/superadmin/users/${id}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    }).then(parseResponse),
  },

  barber: {
    login: (credentials) => fetch(`${API_BASE_URL}/barber/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(parseResponse),

    register: (data) => fetch(`${API_BASE_URL}/barber/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(parseResponse),

    getProfile: () => fetch(`${API_BASE_URL}/barber/profile`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(parseResponse),

    updateProfile: (data) => fetch(`${API_BASE_URL}/barber/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(parseResponse),

    getServices: () => fetch(`${API_BASE_URL}/barber/services`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(parseResponse),

    createService: (data) => fetch(`${API_BASE_URL}/barber/services`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(parseResponse),

    updateService: (id, data) => fetch(`${API_BASE_URL}/barber/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(parseResponse),

    deleteService: (id) => fetch(`${API_BASE_URL}/barber/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(parseResponse),

    getAppointments: (query) => {
      const params = new URLSearchParams(query).toString();
      return fetch(`${API_BASE_URL}/barber/appointments?${params}`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(parseResponse);
    },

    updateAppointment: (id, data) => fetch(`${API_BASE_URL}/barber/appointments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(parseResponse),

    getStatistics: () => fetch(`${API_BASE_URL}/barber/statistics`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(parseResponse),
  },

  customer: {
    register: (data) => fetch(`${API_BASE_URL}/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(parseResponse),

    login: (credentials) => fetch(`${API_BASE_URL}/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(parseResponse),

    getProfile: () => fetch(`${API_BASE_URL}/customer/profile`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(parseResponse),

    updateProfile: (data) => fetch(`${API_BASE_URL}/customer/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(parseResponse),

    getServices: () => fetch(`${API_BASE_URL}/customer/services`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(parseResponse),

    getAvailableSlots: (date) => fetch(`${API_BASE_URL}/customer/slots?date=${date}`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(parseResponse),

    bookAppointment: (data) => fetch(`${API_BASE_URL}/customer/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(parseResponse),

    getAppointments: (query) => {
      const params = new URLSearchParams(query).toString();
      return fetch(`${API_BASE_URL}/customer/appointments?${params}`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(parseResponse);
    },

    cancelAppointment: (id) => fetch(`${API_BASE_URL}/customer/appointments/${id}/cancel`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status: 'cancelled' }),
    }).then(parseResponse),
  },
};

export default api;
