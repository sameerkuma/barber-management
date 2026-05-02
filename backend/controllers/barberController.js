const User = require('../models/User');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

const barberController = {
  // Barber login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }
      
      const user = await User.findOne({ email, role: 'barber' });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const isMatch = await auth.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const token = auth.generateToken(user);

      res.status(200).json({
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Barber login error:', error);
      res.status(500).json({ message: 'Login failed.', error: error.message });
    }
  },

  // Barber registration
  register: async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required.' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }

      // Hash the password
      const hashedPassword = await auth.hashPassword(password);

      // Create new barber
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'barber'
      });

      await user.save();

      // Generate token
      const token = auth.generateToken(user);

      res.status(201).json({
        message: 'Registration successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Barber registration error:', error);
      res.status(500).json({ message: 'Registration failed.', error: error.message });
    }
  },

  // Get barber profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Failed to get profile.', error: error.message });
    }
  },

  // Update barber profile
  updateProfile: async (req, res) => {
    try {
      const { name, phone } = req.body;
      
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;

      await user.save();

      res.status(200).json({
        message: 'Profile updated successfully.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile.', error: error.message });
    }
  },

  // Create a new service
  createService: async (req, res) => {
    try {
      const { name, description, duration, price, category } = req.body;

      const service = new Service({
        name,
        description,
        duration,
        price,
        category
      });

      await service.save();

      res.status(201).json({
        message: 'Service created successfully.',
        service
      });
    } catch (error) {
      console.error('Create service error:', error);
      res.status(500).json({ message: 'Failed to create service.', error: error.message });
    }
  },

  // Get all services
  getServices: async (req, res) => {
    try {
      const services = await Service.find({ isActive: true });
      res.status(200).json({ services });
    } catch (error) {
      console.error('Get services error:', error);
      res.status(500).json({ message: 'Failed to fetch services.', error: error.message });
    }
  },

  // Update service
  updateService: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, duration, price, category, isActive } = req.body;

      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found.' });
      }

      if (name) service.name = name;
      if (description) service.description = description;
      if (duration) service.duration = duration;
      if (price) service.price = price;
      if (category) service.category = category;
      if (isActive !== undefined) service.isActive = isActive;

      await service.save();

      res.status(200).json({
        message: 'Service updated successfully.',
        service
      });
    } catch (error) {
      console.error('Update service error:', error);
      res.status(500).json({ message: 'Failed to update service.', error: error.message });
    }
  },

  // Delete service
  deleteService: async (req, res) => {
    try {
      const { id } = req.params;
      
      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found.' });
      }

      service.isActive = false;
      await service.save();

      res.status(200).json({ message: 'Service deleted successfully.' });
    } catch (error) {
      console.error('Delete service error:', error);
      res.status(500).json({ message: 'Failed to delete service.', error: error.message });
    }
  },

  // Get all appointments for barber/admin with optional filtering
  getAppointments: async (req, res) => {
    try {
      const { status, date } = req.query;
      
      const query = {};
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        query.date = { $gte: startDate, $lt: endDate };
      }

      const appointments = await Appointment.find(query)
        .populate('customer', 'name email phone')
        .populate('service', 'name duration price')
        .populate('barber', 'name')
        .sort({ date: 1, time: 1 });

      res.status(200).json({ appointments });
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ message: 'Failed to fetch appointments.', error: error.message });
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found.' });
      }

      if (status) appointment.status = status;
      if (notes) appointment.notes = notes;

      await appointment.save();

      res.status(200).json({
        message: 'Appointment updated successfully.',
        appointment
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ message: 'Failed to update appointment.', error: error.message });
    }
  },

  // Get appointment statistics
  getStatistics: async (req, res) => {
    try {
      const totalAppointments = await Appointment.countDocuments({ barber: req.user.id });
      const pendingAppointments = await Appointment.countDocuments({ barber: req.user.id, status: 'pending' });
      const confirmedAppointments = await Appointment.countDocuments({ barber: req.user.id, status: 'confirmed' });
      const completedAppointments = await Appointment.countDocuments({ barber: req.user.id, status: 'completed' });

      const services = await Service.countDocuments({ isActive: true });

      res.status(200).json({
        statistics: {
          totalAppointments,
          pendingAppointments,
          confirmedAppointments,
          completedAppointments,
          totalServices: services
        }
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ message: 'Failed to fetch statistics.', error: error.message });
    }
  }
};

module.exports = barberController;
