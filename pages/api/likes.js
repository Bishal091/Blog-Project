import pool from '../../lib/db';
import { authMiddleware } from '../../lib/authMiddleware';

const likePostHandler = async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.userId; // User ID from the token

  // Check if the user has already liked the post
  const { rows } = await pool.query('SELECT * FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
  if (rows.length > 0) {
    // Unlike the post
    await pool.query('DELETE FROM likes WHERE id = $1', [rows[0].id]);
    res.status(200).json({ message: 'Post unliked' });
  } else {
    // Like the post
    const { rows: newLike } = await pool.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *',
      [userId, postId]
    );
    res.status(201).json(newLike[0]);
  }
};

export default authMiddleware(likePostHandler);