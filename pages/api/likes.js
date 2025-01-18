import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { user_id, post_id } = req.body;

    // Check if the user has already liked the post
    const { rows } = await pool.query('SELECT * FROM likes WHERE user_id = $1 AND post_id = $2', [user_id, post_id]);
    if (rows.length > 0) {
      // Unlike the post
      await pool.query('DELETE FROM likes WHERE id = $1', [rows[0].id]);
      res.status(200).json({ message: 'Post unliked' });
    } else {
      // Like the post
      const { rows: newLike } = await pool.query(
        'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *',
        [user_id, post_id]
      );
      res.status(201).json(newLike[0]);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}