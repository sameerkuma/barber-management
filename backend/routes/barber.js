const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const auth = require('../middleware/auth');

// Public routes
router.post('/login', barberController.login);
router.post('/register', barberController.register);

// Protected routes (Barber only)
router.get('/profile', auth.verifyToken, auth.authorize('barber', 'admin'), barberController.getProfile);
router.put('/profile', auth.verifyToken, auth.authorize('barber', 'admin'), barberController.updateProfile);

// Services management
router.post('/services', auth.verifyToken, auth.authorize('barber', 'admin'), barberController.createService);
router.get('/services', auth.verifyToken, auth.authorize('barber', 'admin'), barberController.getServices);
router.put('/services/:id', auth.verifyToken, auth.authorize('barber', 'admin'), barberController.updateService);
router.delete('/services/:id', auth.verifyToken, auth.authorize('barber', 'admin'), barberController.deleteService);

// Appointments management
router.get('/appointments', auth.verifyToken, auth.authorize('barber', 'admin'), barberController.getAppointments);
router.put('/appointments/:id', auth.verifyToken, auth.authorize('barber', 'admin'), barberController.updateAppointmentStatus);

// Statistics
router.get('/statistics', auth.verifyToken, auth.authorize('barber', 'admin'), barberController.getStatistics);

module.exports = router;