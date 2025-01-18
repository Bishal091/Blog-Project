import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};