const express = require('express');
const router = express.Router();
const { analyze, upload } = require('../controllers/analysisController');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and attach decoded user to req.user
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECURE_JWT_SECRET_KEY';
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Analysis route
router.post('/analyze', verifyToken, upload.single('image'), analyze);

module.exports = router;
