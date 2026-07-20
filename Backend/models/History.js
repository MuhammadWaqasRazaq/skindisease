const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String },          // Example: if storing uploaded image
    prediction: { type: String },        // Example: detected skin disease
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);
