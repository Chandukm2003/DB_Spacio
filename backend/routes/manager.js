const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { authenticateJWT, authorizeManager } = require('../middleware/authMiddleware');

// Routes accessible to manager
router.get('/employees', authenticateJWT, authorizeManager, managerController.getAllEmployees);
router.post('/assign-task', authenticateJWT, authorizeManager, managerController.assignTask);

// ✨ Add this if you want employees to fetch their tasks via manager route
// Optional: You can later move this to `routes/employee.js`
router.get('/tasks', authenticateJWT, managerController.getTasksForEmployee);

module.exports = router;
