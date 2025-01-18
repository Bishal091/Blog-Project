const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Fetch posts with pagination
export const fetchPosts = async (page = 1, limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  };
  export const fetchPostDetails = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts?id=${postId}`);
      console.log("Response:", response); // Log the response
      if (!response.ok) {
        const errorData = await response.json(); // Log the error details
        console.error("Error data:", errorData);
        throw new Error("Failed to fetch post details");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching post details:", error);
      throw error;
    }
  };

// Create a new post
export const createPost = async (postData, token) => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });
  if (!response.ok) throw new Error('Failed to create post');
  return response.json();
};

// Login user
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', ...credentials }),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

// Register user
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
};

// Create a comment
export const createComment = async (postId, content, token) => {
  const response = await fetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId, content }),
  });
  if (!response.ok) throw new Error('Failed to create comment');
  return response.json();
};

// Like or unlike a post
export const likePost = async (postId, token) => {
  const response = await fetch(`${API_BASE_URL}/likePost?postId=${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to toggle like');
  return response.json(); // { success: true, likeCount }
};

