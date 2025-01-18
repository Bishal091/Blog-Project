import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Fetch comments for a post
    const { postId } = req.query;
    const { rows } = await pool.query('SELECT * FROM comments WHERE post_id = $1', [postId]);
    res.status(200).json(rows);
  } else if (req.method === 'POST') {
    // Create a new comment
    const { content, user_id, post_id } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO comments (content, user_id, post_id) VALUES ($1, $2, $3) RETURNING *',
      [content, user_id, post_id]
    );
    res.status(201).json(rows[0]);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}