const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const jwt = require('jsonwebtoken'); // Required for middleware implementation

// --- Authentication Middleware (for History Routes only) ---
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECURE_JWT_SECRET_KEY';

const authenticateTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); 

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user;
        next();
    });
};

router.get('/history', authenticateTokenMiddleware, historyController.getHistory);
router.post('/history', authenticateTokenMiddleware, historyController.saveHistory);

module.exports = router;