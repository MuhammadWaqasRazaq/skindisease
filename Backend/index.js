require('dotenv').config({ debug: true });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = '/api';
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://skindisease-frontend.onrender.com,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(API_PREFIX, authRoutes);
app.use(API_PREFIX, historyRoutes);
app.use(API_PREFIX, analysisRoutes);

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
