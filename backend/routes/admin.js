const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and controls
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: View all registered users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const roles = ['employee', 'Employee', 'manager','Manager'];
    const result = await pool.query('SELECT * FROM employees WHERE role = ANY($1)', [roles]);
    console.log('📤 DB Results:', result.rows); 
    res.json(result.rows);
  } catch (err) {
    console.error('[ERROR]: View Users -', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

/**
 * @swagger
 * /admin/user/{id}/assign-department:
 *   put:
 *     summary: Assign department to a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - department
 *             properties:
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/user/:id/assign-department', authenticate, authorizeAdmin, async (req, res) => {
  const { department } = req.body;
  const userId = req.params.id;

  if (!department) {
    return res.status(400).json({ message: 'Department is required' });
  }

  try {
    await pool.query('UPDATE employees SET department = $1 WHERE employee_id = $2', [department, userId]);
    res.json({ message: '✅ Department updated successfully' });
  } catch (err) {
    console.error('[ERROR]: Assign Department -', err);
    res.status(500).json({ message: '❌ Failed to update department' });
  }
});

/**
 * @swagger
 * /admin/user/{id}/assign-role:
 *   put:
 *     summary: Assign role to a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 example: manager
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Bad Request
 */
router.put('/user/:id/assign-role', authenticate, authorizeAdmin, async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  try {
    await pool.query('UPDATE employees SET role = $1 WHERE employee_id = $2', [role, userId]);
    res.json({ message: '✅ Role updated successfully' });
  } catch (err) {
    console.error('[ERROR]: Assign Role -', err);
    res.status(500).json({ message: '❌ Failed to update role' });
  }
});

/**
 * @swagger
 * /admin/user/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.delete('/user/:id', authenticate, authorizeAdmin, async (req, res) => {
  const employeeId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM employees WHERE employee_id = $1 RETURNING *', [employeeId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: '❌ Employee not found' });
    }

    res.json({ message: '🗑️ Employee deleted successfully' });
  } catch (err) {
    console.error('[ERROR]: Delete Employee -', err);
    res.status(500).json({ message: '❌ Server error while deleting employee' });
  }
});

module.exports = router;
