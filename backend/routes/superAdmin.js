const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const auth = require('../middleware/auth');

// Public routes
router.post('/login', superAdminController.superAdminLogin);

// Protected routes (Super Admin only)
router.post('/tenants', auth.verifyToken, auth.authorize('superadmin'), superAdminController.createTenant);
router.get('/tenants', auth.verifyToken, auth.authorize('superadmin'), superAdminController.getAllTenants);
router.get('/tenants/:id', auth.verifyToken, auth.authorize('superadmin'), superAdminController.getTenantById);
router.put('/tenants/:id', auth.verifyToken, auth.authorize('superadmin'), superAdminController.updateTenant);
router.delete('/tenants/:id', auth.verifyToken, auth.authorize('superadmin'), superAdminController.deleteTenant);

module.exports = router;