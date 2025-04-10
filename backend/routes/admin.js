const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // <- correct import if db is in /config
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
    const result = await pool.query('SELECT * FROM employees');
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

  try {
    await pool.query('UPDATE employees SET department = $1 WHERE employee_id = $2', [department, userId]);
    res.json({ message: 'Department updated successfully' });
  } catch (err) {
    console.error('[ERROR]: Assign Department -', err);
    res.status(500).json({ message: 'Failed to update department' });
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
 */
router.put('/user/:id/assign-role', authenticate, authorizeAdmin, async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  try {
    await pool.query('UPDATE employees SET role = $1 WHERE employee_id = $2', [role, userId]);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    console.error('[ERROR]: Assign Role -', err);
    res.status(500).json({ message: 'Failed to update role' });
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.delete('/user/:id', authenticate, authorizeAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    await pool.query('DELETE FROM employees WHERE employee_id = $1', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('[ERROR]: Delete User -', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
