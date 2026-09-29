const express = require('express');
const router = express.Router();

const { registerUser, registerAdmin } = require('../controllers/register');
const { loginUser } = require('../controllers/login');
const { getProfile } = require('../controllers/profile.js');
const { createEvent } = require('../controllers/createEvent');
const { getCreatedEvents } = require('../controllers/showEvents');
const { updatePoints } = require('../controllers/updatePoints');
const { getLeaderboard } = require('../controllers/leaderboard');
const { donate } = require('../controllers/donate');
const { addScanHistory, getScanHistory } = require('../controllers/scanHistory');
const { getAllUsers, toggleAdminRole, deleteEventAdmin } = require('../controllers/admin');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerUser);
router.post('/admin/register', authLimiter, registerAdmin);
router.post('/login', authLimiter, loginUser);
router.get('/profile', authenticate, getProfile);
router.post('/events', authenticate, requireAdmin, createEvent);
router.get('/eventscreated', getCreatedEvents);
router.post('/points', authenticate, updatePoints);
router.post('/scan-history', authenticate, addScanHistory);
router.get('/scan-history', authenticate, getScanHistory);
router.get('/leaderboard', getLeaderboard);
router.post('/donate', donate);

router.get('/admin/users', authenticate, requireAdmin, getAllUsers);
router.patch('/admin/users/:id/toggle-admin', authenticate, requireAdmin, toggleAdminRole);
router.delete('/admin/events/:id', authenticate, requireAdmin, deleteEventAdmin);

module.exports = router;
