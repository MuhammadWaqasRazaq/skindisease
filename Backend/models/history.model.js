const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  diseaseName: { type: String, required: true },
  confidence: { type: Number, required: true },
  imageUrl: { type: String },
  details: { type: String },
  probabilities: [{ disease: String, probability: Number }],
  timestamp: { type: Date, default: Date.now },
  analysisId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);
