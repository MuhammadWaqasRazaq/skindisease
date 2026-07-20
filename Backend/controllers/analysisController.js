const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

// Configure multer for image uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';

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
  const prediction = apiResponse?.prediction || {};
  const probabilities = Array.isArray(apiResponse?.probabilities) ? apiResponse.probabilities : [];

  return {
    prediction: {
      disease: prediction.disease || apiResponse?.class_name || 'Unknown',
      confidence: Number(prediction.confidence ?? apiResponse?.confidence ?? 0),
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

  let response;
  try {
    response = await fetch(`${FASTAPI_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    if (error?.cause?.code === 'ECONNREFUSED') {
      throw new Error(`FastAPI service is not running at ${FASTAPI_BASE_URL}. Start it with the project dev launcher or run uvicorn model.app:app on port 8000.`);
    }

    throw new Error(`Failed to contact FastAPI service at ${FASTAPI_BASE_URL}: ${error.message}`);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || 'FastAPI prediction failed');
  }

  return payload;
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
