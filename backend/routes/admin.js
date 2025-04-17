const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and controls
 */

router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const roles = ['employee', 'Employee', 'manager', 'Manager'];
    const users = await Employee.find({ role: { $in: roles } });
    console.log('📤 DB Results:', users);
    res.json(users);
  } catch (err) {
    console.error('[ERROR]: View Users -', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.put('/user/:id/assign-department', authenticate, authorizeAdmin, async (req, res) => {
  const { department } = req.body;
  const userId = req.params.id;

  if (!department) {
    return res.status(400).json({ message: 'Department is required' });
  }

  try {
    const user = await Employee.findByIdAndUpdate(userId, { department }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: '✅ Department updated successfully', user });
  } catch (err) {
    console.error('[ERROR]: Assign Department -', err);
    res.status(500).json({ message: '❌ Failed to update department' });
  }
});

router.put('/user/:id/assign-role', authenticate, authorizeAdmin, async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  try {
    const user = await Employee.findByIdAndUpdate(userId, { role }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: '✅ Role updated successfully', user });
  } catch (err) {
    console.error('[ERROR]: Assign Role -', err);
    res.status(500).json({ message: '❌ Failed to update role' });
  }
});

router.delete('/user/:id', authenticate, authorizeAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await Employee.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: '❌ Employee not found' });
    }

    res.json({ message: '🗑️ Employee deleted successfully' });
  } catch (err) {
    console.error('[ERROR]: Delete Employee -', err);
    res.status(500).json({ message: '❌ Server error while deleting employee' });
  }
});

module.exports = router;