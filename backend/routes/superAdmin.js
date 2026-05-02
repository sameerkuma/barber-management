const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const auth = require('../middleware/auth');

// Public routes
router.post('/login', superAdminController.superAdminLogin);

// Protected routes (Admin only)
router.post('/tenants', auth.verifyToken, auth.authorize('superadmin', 'admin'), superAdminController.createTenant);
router.get('/tenants', auth.verifyToken, auth.authorize('superadmin', 'admin'), superAdminController.getAllTenants);
router.get('/tenants/:id', auth.verifyToken, auth.authorize('superadmin', 'admin'), superAdminController.getTenantById);
router.put('/tenants/:id', auth.verifyToken, auth.authorize('superadmin', 'admin'), superAdminController.updateTenant);
router.delete('/tenants/:id', auth.verifyToken, auth.authorize('superadmin', 'admin'), superAdminController.deleteTenant);
router.get('/users', auth.verifyToken, auth.authorize('superadmin', 'admin'), superAdminController.getAllUsers);
router.put('/users/:id/role', auth.verifyToken, auth.authorize('superadmin', 'admin'), superAdminController.updateUserRole);

module.exports = router;
