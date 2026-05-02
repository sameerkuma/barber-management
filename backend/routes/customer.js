const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', customerController.register);
router.post('/login', customerController.login);
router.get('/services', customerController.getServices);
router.get('/slots', customerController.getAvailableSlots);

// Protected routes (Customer only)
router.get('/profile', auth.verifyToken, auth.authorize('customer'), customerController.getProfile);
router.put('/profile', auth.verifyToken, auth.authorize('customer'), customerController.updateProfile);

// Appointments
router.post('/appointments', auth.verifyToken, auth.authorize('customer'), customerController.bookAppointment);
router.get('/appointments', auth.verifyToken, auth.authorize('customer'), customerController.getAppointments);
router.put('/appointments/:id/cancel', auth.verifyToken, auth.authorize('customer'), customerController.cancelAppointment);

module.exports = router;