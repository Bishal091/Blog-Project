const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const fetchPosts = async (page = 1, limit = 10) => {
  const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
};

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

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', ...credentials }),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
};
export const createComment = async (postId, content, token) => {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, content }),
    });
    if (!response.ok) throw new Error("Failed to create comment");
    return response.json();
  };