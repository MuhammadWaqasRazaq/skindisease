const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

// Configure multer for image uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'https://skindisease-pvfo.onrender.com';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
    cb(null, 'analysis-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const History = require('../models/history.model');

const normalizePrediction = (apiResponse, fallbackFilename) => {
  const probabilities = Array.isArray(apiResponse?.probabilities) ? apiResponse.probabilities : [];

  const disease = apiResponse?.disease || apiResponse?.prediction?.disease || apiResponse?.class_name || 'Unknown';
  const confidence = Number(apiResponse?.confidence ?? apiResponse?.prediction?.confidence ?? 0);

  return {
    prediction: {
      disease,
      confidence,
    },
    probabilities,
    details: apiResponse?.details || apiResponse?.message || `Analysis completed for ${fallbackFilename}.`,
    recommendations: apiResponse?.recommendations || 'Consult a dermatologist for a clinical diagnosis.',
    raw: apiResponse,
  };
};

const analyzeWithFastAPI = async (filePath, fileName, mimeType) => {
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(filePath);

  formData.append('file', new Blob([fileBuffer], { type: mimeType }), fileName);

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 5000;
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let response;
    try {
      response = await fetch(`${FASTAPI_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(60000),
      });
    } catch (error) {
      lastError = error;
      if (error?.cause?.code === 'ECONNREFUSED' || error.name === 'TimeoutError' || error.name === 'AbortError') {
        console.warn(`FastAPI attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}. Retrying...`);
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw new Error(`Failed to contact FastAPI service at ${FASTAPI_BASE_URL}: ${error.message}`);
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = payload?.detail || payload?.message || `HTTP ${response.status}`;
      lastError = new Error(`FastAPI prediction failed: ${detail}`);
      console.warn(`FastAPI attempt ${attempt}/${MAX_RETRIES} returned ${response.status}: ${detail}`);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      break;
    }

    return payload;
  }

  throw lastError || new Error('FastAPI prediction failed after multiple retries');
};

exports.upload = upload;

exports.analyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // userId should come from verified JWT (set in req.user by middleware)
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const fastApiResult = await analyzeWithFastAPI(req.file.path, req.file.filename, req.file.mimetype);
    const prediction = normalizePrediction(fastApiResult, req.file.filename);

    // Build image URL (served statically at /uploads)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Save history record to DB
    try {
      const historyItem = new History({
        userId,
        diseaseName: prediction.prediction.disease,
        confidence: prediction.prediction.confidence,
        imageUrl,
        analysisId: req.file.filename,
        timestamp: Date.now(),
        details: prediction.details || null,
        probabilities: prediction.probabilities || [],
      });
      await historyItem.save();
    } catch (saveErr) {
      console.error('Failed to save history item:', saveErr);
      // continue and still return prediction
    }

    // Return prediction and meta
    res.json({
      success: true,
      analysisId: req.file.filename,
      timestamp: new Date(),
      imageUrl,
      ...prediction
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: error.message || 'Analysis failed' });
  }
};
