import pool from '../../lib/db';
import { authMiddleware } from '../../lib/authMiddleware';
import { postSchema } from '../../lib/validation';

// Fetch posts with pagination
const getPostsHandler = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Fetch paginated posts with author information
    const { rows: posts } = await pool.query(
      `SELECT posts.*, users.username as author_username 
       FROM posts 
       INNER JOIN users ON posts.user_id = users.id 
       ORDER BY posts.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Fetch total count of posts
    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM posts');
    const totalCount = parseInt(countRows[0].count, 10);

    // Return response with posts and total count
    res.status(200).json({
      posts: posts.map(post => ({
        ...post,
        author: { username: post.author_username }, // Include author information
      })),
      totalCount,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch a single post by ID
const getPostDetailsHandler = async (req, res) => {
    const { id } = req.query; // Post ID from the URL
  
    try {
      // Fetch post details with author and tags
      const { rows: postRows } = await pool.query(
        `SELECT posts.*, users.username as author_username 
         FROM posts
         INNER JOIN users ON posts.user_id = users.id
         WHERE posts.id = $1
         GROUP BY posts.id, users.username`,
        [id]
      );
  
      if (postRows.length === 0) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      const post = postRows[0];
  
      // Fetch comments for the post
      const { rows: commentRows } = await pool.query(
        `SELECT comments.*, users.username as author_username
         FROM comments
         INNER JOIN users ON comments.user_id = users.id
         WHERE comments.post_id = $1
         ORDER BY comments.created_at ASC`,
        [id]
      );
  
      // Return the post with comments and tags
      res.status(200).json({
        ...post,
        comments: commentRows,
      });
    } catch (error) {
      console.error('Error fetching post details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

// Create a new post (protected route)
const createPostHandler = async (req, res) => {
  const { error } = postSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { title, content } = req.body;
  const userId = req.user.userId; // User ID from the token

  try {
    const { rows } = await pool.query(
      'INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, userId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a post (protected route)
const updatePostHandler = async (req, res) => {
  const { id } = req.query; // Post ID from the URL
  const { title, content } = req.body;
  const userId = req.user.userId; // User ID from the token

  try {
    // Check if the post belongs to the user
    const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rows.length === 0) {
      return res.status(403).json({ message: 'You are not authorized to update this post' });
    }

    // Update the post
    const updatedPost = await pool.query(
      'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    res.status(200).json(updatedPost.rows[0]);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a post (protected route)
const deletePostHandler = async (req, res) => {
  const { id } = req.query; // Post ID from the URL
  const userId = req.user.userId; // User ID from the token

  try {
    // Check if the post belongs to the user
    const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rows.length === 0) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    // Delete the post
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Main handler
const handler = async (req, res) => {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      if (id) {
        // Fetch a single post by ID
        return getPostDetailsHandler(req, res);
      } else {
        // Fetch paginated posts
        return getPostsHandler(req, res);
      }
    case 'POST':
    case 'PUT':
    case 'DELETE':
      // Apply authMiddleware to POST, PUT, and DELETE methods
      return authMiddleware(async (req, res) => {
        switch (req.method) {
          case 'POST':
            return createPostHandler(req, res);
          case 'PUT':
            return updatePostHandler(req, res);
          case 'DELETE':
            return deletePostHandler(req, res);
          default:
            res.status(405).json({ message: 'Method not allowed' });
        }
      })(req, res);
    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;