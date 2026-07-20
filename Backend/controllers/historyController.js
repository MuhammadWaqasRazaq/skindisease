const History = require('../models/history.model');

exports.getHistory = async (req, res) => {
    const userId = req.user.id; // Extracted from JWT by middleware

    try {
        const userHistory = await History.find({ userId }).sort({ timestamp: -1 }).lean();
        return res.json(userHistory);
    } catch (error) {
        console.error('Get History error:', error);
        return res.status(500).send({ message: 'Server error retrieving history.' });
    }
};

exports.saveHistory = async (req, res) => {
    const { diseaseName, confidence, imageUrl, analysisId } = req.body;
    const userId = req.user.id; // Extracted from JWT by middleware

    if (!diseaseName || confidence === undefined) {
        return res.status(400).send({ message: 'Missing required history data.' });
    }

    try {
        const newItem = new History({
            userId,
            diseaseName,
            confidence: parseFloat(confidence),
            imageUrl: imageUrl || null,
            analysisId: analysisId || null,
            timestamp: Date.now(),
        });

        await newItem.save();

        return res.status(201).send({ message: 'History saved.', item: newItem });
    } catch (error) {
        console.error('Save History error:', error);
        return res.status(500).send({ message: 'Server error saving history.' });
    }
};