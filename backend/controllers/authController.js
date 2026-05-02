const User = require('../models/User');
const auth = require('../middleware/auth');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role
});

const authController = {
  signup: async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required.' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'An account already exists with this email.' });
      }

      const hashedPassword = await auth.hashPassword(password);
      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'customer'
      });

      const token = auth.generateToken(user);
      res.status(201).json({
        message: 'Signup successful.',
        token,
        user: sanitizeUser(user)
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Signup failed.', error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const user = await User.findOne({ email, isActive: true });
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
        user: sanitizeUser(user)
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed.', error: error.message });
    }
  }
};

module.exports = authController;
