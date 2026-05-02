const User = require('../models/User');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

const customerController = {
  // Customer registration
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

      // Create new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'customer'
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
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed.', error: error.message });
    }
  },

  // Customer login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const user = await User.findOne({ email, role: 'customer' });
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
      console.error('Customer login error:', error);
      res.status(500).json({ message: 'Login failed.', error: error.message });
    }
  },

  // Get customer profile
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

  // Update customer profile
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

  // Get all available services
  getServices: async (req, res) => {
    try {
      const services = await Service.find({ isActive: true });
      res.status(200).json({ services });
    } catch (error) {
      console.error('Get services error:', error);
      res.status(500).json({ message: 'Failed to fetch services.', error: error.message });
    }
  },

  // Book an appointment
  bookAppointment: async (req, res) => {
    try {
      const { serviceId, date, time, notes } = req.body;

      // Verify service exists
      const service = await Service.findById(serviceId);
      if (!service || !service.isActive) {
        return res.status(404).json({ message: 'Service not found or unavailable.' });
      }

      // Check for conflicting appointments
      const conflictingAppointment = await Appointment.findOne({
        date: new Date(date),
        time: time,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (conflictingAppointment) {
        return res.status(400).json({ message: 'This time slot is already booked.' });
      }

      // Create appointment
      const appointment = new Appointment({
        customer: req.user.id,
        service: serviceId,
        date: new Date(date),
        time,
        notes,
        status: 'pending'
      });

      await appointment.save();

      // Populate the appointment for response
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('service', 'name duration price')
        .populate('customer', 'name email');

      res.status(201).json({
        message: 'Appointment booked successfully.',
        appointment: populatedAppointment
      });
    } catch (error) {
      console.error('Book appointment error:', error);
      res.status(500).json({ message: 'Failed to book appointment.', error: error.message });
    }
  },

  // Get customer's appointments
  getAppointments: async (req, res) => {
    try {
      const { status } = req.query;
      
      let query = { customer: req.user.id };
      
      if (status) {
        query.status = status;
      }

      const appointments = await Appointment.find(query)
        .populate('service', 'name duration price')
        .populate('barber', 'name')
        .sort({ date: -1, time: -1 });

      res.status(200).json({ appointments });
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ message: 'Failed to fetch appointments.', error: error.message });
    }
  },

  // Cancel appointment
  cancelAppointment: async (req, res) => {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findOne({ _id: id, customer: req.user.id });
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found.' });
      }

      if (appointment.status === 'completed') {
        return res.status(400).json({ message: 'Cannot cancel a completed appointment.' });
      }

      appointment.status = 'cancelled';
      await appointment.save();

      res.status(200).json({
        message: 'Appointment cancelled successfully.',
        appointment
      });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      res.status(500).json({ message: 'Failed to cancel appointment.', error: error.message });
    }
  },

  // Get available time slots
  getAvailableSlots: async (req, res) => {
    try {
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: 'Date is required.' });
      }

      const requestedDate = new Date(date);
      const dayStart = new Date(requestedDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(requestedDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Get all booked slots for the date
      const bookedAppointments = await Appointment.find({
        date: { $gte: dayStart, $lt: dayEnd },
        status: { $in: ['pending', 'confirmed'] }
      }).select('time');

      const bookedTimes = bookedAppointments.map(apt => apt.time);

      // Generate available time slots (9 AM to 6 PM, 30-minute intervals)
      const allSlots = [];
      for (let hour = 9; hour < 18; hour++) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }

      // Filter out booked slots
      const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

      res.status(200).json({ availableSlots });
    } catch (error) {
      console.error('Get available slots error:', error);
      res.status(500).json({ message: 'Failed to fetch available slots.', error: error.message });
    }
  }
};

module.exports = customerController;
