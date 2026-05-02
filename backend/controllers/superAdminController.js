const Tenant = require('../models/Tenant');
const User = require('../models/User');
const auth = require('../middleware/auth');

const superAdminController = {
  // Create a new tenant (Super Admin only)
  createTenant: async (req, res) => {
    try {
      const { name, slug, email, phone, address, logo, ownerName, ownerEmail, ownerPassword, subscriptionPlan } = req.body;

      // Check if tenant already exists
      const existingTenant = await Tenant.findOne({ $or: [{ slug }, { email }] });
      if (existingTenant) {
        return res.status(400).json({ message: 'Tenant with this slug or email already exists.' });
      }

      // Hash the owner password
      const hashedPassword = await auth.hashPassword(ownerPassword);

      // Create new tenant
      const tenant = new Tenant({
        name,
        slug: slug.toLowerCase(),
        email,
        phone,
        address,
        logo,
        ownerName,
        ownerEmail,
        ownerPassword: hashedPassword,
        subscriptionPlan: subscriptionPlan || 'free'
      });

      await tenant.save();

      res.status(201).json({
        message: 'Tenant created successfully.',
        tenant: {
          id: tenant._id,
          name: tenant.name,
          slug: tenant.slug,
          email: tenant.email,
          subscriptionPlan: tenant.subscriptionPlan
        }
      });
    } catch (error) {
      console.error('Create tenant error:', error);
      res.status(500).json({ message: 'Failed to create tenant.', error: error.message });
    }
  },

  // Get all tenants (Super Admin only)
  getAllTenants: async (req, res) => {
    try {
      const tenants = await Tenant.find().select('-ownerPassword');
      res.status(200).json({ tenants });
    } catch (error) {
      console.error('Get tenants error:', error);
      res.status(500).json({ message: 'Failed to fetch tenants.', error: error.message });
    }
  },

  // Get tenant by ID (Super Admin only)
  getTenantById: async (req, res) => {
    try {
      const { id } = req.params;
      const tenant = await Tenant.findById(id).select('-ownerPassword');
      
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found.' });
      }

      res.status(200).json({ tenant });
    } catch (error) {
      console.error('Get tenant error:', error);
      res.status(500).json({ message: 'Failed to fetch tenant.', error: error.message });
    }
  },

  // Update tenant (Super Admin only)
  updateTenant: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, address, logo, isActive, subscriptionPlan } = req.body;

      const tenant = await Tenant.findById(id);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found.' });
      }

      // Update fields
      if (name) tenant.name = name;
      if (email) tenant.email = email;
      if (phone) tenant.phone = phone;
      if (address) tenant.address = address;
      if (logo) tenant.logo = logo;
      if (isActive !== undefined) tenant.isActive = isActive;
      if (subscriptionPlan) tenant.subscriptionPlan = subscriptionPlan;

      await tenant.save();

      res.status(200).json({
        message: 'Tenant updated successfully.',
        tenant: {
          id: tenant._id,
          name: tenant.name,
          slug: tenant.slug,
          email: tenant.email,
          isActive: tenant.isActive,
          subscriptionPlan: tenant.subscriptionPlan
        }
      });
    } catch (error) {
      console.error('Update tenant error:', error);
      res.status(500).json({ message: 'Failed to update tenant.', error: error.message });
    }
  },

  // Delete tenant (Super Admin only)
  deleteTenant: async (req, res) => {
    try {
      const { id } = req.params;
      const tenant = await Tenant.findById(id);
      
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found.' });
      }

      await Tenant.findByIdAndDelete(id);

      res.status(200).json({ message: 'Tenant deleted successfully.' });
    } catch (error) {
      console.error('Delete tenant error:', error);
      res.status(500).json({ message: 'Failed to delete tenant.', error: error.message });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.status(200).json({ users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const allowedRoles = ['customer', 'barber', 'admin'];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role.' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      user.role = role;
      await user.save();

      res.status(200).json({
        message: 'User role updated successfully.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Failed to update user role.', error: error.message });
    }
  },

  // Super Admin login
  superAdminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if super admin credentials (using env variables)
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@barber.com';
      const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';

      if (email !== superAdminEmail || password !== superAdminPassword) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const token = auth.generateToken({
        _id: 'superadmin',
        email,
        role: 'superadmin'
      });

      res.status(200).json({
        message: 'Login successful.',
        token,
        user: { email, role: 'superadmin' }
      });
    } catch (error) {
      console.error('Super admin login error:', error);
      res.status(500).json({ message: 'Login failed.', error: error.message });
    }
  }
};

module.exports = superAdminController;
