const connectDB = require('../config/db');

const tenantMiddleware = {
  // Extract tenant slug from request
  extractTenant: async (req, res, next) => {
    const tenantSlug = req.headers['x-tenant-slug'] || req.query.tenant;
    
    if (!tenantSlug) {
      return res.status(400).json({ message: 'Tenant identifier is required.' });
    }

    req.tenantSlug = tenantSlug;
    next();
  },

  // Connect to tenant database
  connectTenant: async (req, res, next) => {
    const tenantSlug = req.tenantSlug;
    
    if (!tenantSlug) {
      return res.status(400).json({ message: 'Tenant identifier is required.' });
    }

    try {
      // Connect to tenant-specific database
      const dbName = `barber_${tenantSlug}`;
      await connectDB(dbName);
      req.tenantDbName = dbName;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Failed to connect to tenant database.' });
    }
  }
};

module.exports = tenantMiddleware;