import pool from '../../lib/db';
import bcrypt from 'bcrypt';
import { generateToken } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, email, password } = req.body;

    // Check if user already exists
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
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

    res.status(201).json({ token, user: newUser.rows[0] });
  } else if (req.method === 'POST' && req.body.action === 'login') {
    const { username, password } = req.body;

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

    res.status(200).json({ token, user: rows[0] });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}