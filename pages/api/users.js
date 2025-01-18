import pool from '../../lib/db';
import bcrypt from 'bcrypt';
import { generateToken } from '../../lib/auth';
import { registerSchema, loginSchema } from '../../lib/validation';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle registration
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );
      if (rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const newUser = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [username, email, hashedPassword]
      );

      // Generate token
      const token = generateToken(newUser.rows[0].id);

      // Return response
      res.status(201).json({ token, user: newUser.rows[0] });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST' && req.body.action === 'login') {
    // Handle login
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password } = req.body;

    try {
      // Find user
      const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (rows.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, rows[0].password_hash);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      // Generate token
      const token = generateToken(rows[0].id);

      // Return response
      res.status(200).json({ token, user: rows[0] });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}