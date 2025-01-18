import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Fetch all posts
    const { rows } = await pool.query('SELECT * FROM posts');
    res.status(200).json(rows);
  } else if (req.method === 'POST') {
    // Create a new post
    const { title, content, user_id } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, user_id]
    );
    res.status(201).json(rows[0]);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}