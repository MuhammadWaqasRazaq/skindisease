require('dotenv').config({ debug: true });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = '/api';

// --- Middleware ---
// CORS
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
}));

// Body parsing MUST come BEFORE routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(bodyParser.json({ limit: '5mb' })); // For large JSON payloads

// Serve uploaded images statically from /uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use(API_PREFIX, authRoutes);
app.use(API_PREFIX, historyRoutes);
app.use(API_PREFIX, analysisRoutes);

// --- Start server ---
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('DB connection failed:', err);
        process.exit(1);
    });
