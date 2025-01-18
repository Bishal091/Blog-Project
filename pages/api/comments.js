import pool from '../../lib/db';
import { authMiddleware } from '../../lib/authMiddleware';

const createCommentHandler = async (req, res) => {
  const { postId, content } = req.body;
  const userId = req.user.userId; // User ID from the token

  const { rows } = await pool.query(
    'INSERT INTO comments (content, user_id, post_id) VALUES ($1, $2, $3) RETURNING *',
    [content, userId, postId]
  );

  res.status(201).json(rows[0]);
};

export default authMiddleware(createCommentHandler);