const History = require('../models/history.model');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../uploads');

const deleteStoredImage = async (historyItem) => {
    const imagePath = historyItem?.imageUrl?.startsWith('/uploads/')
        ? path.join(uploadsDir, path.basename(historyItem.imageUrl))
        : null;

    if (!imagePath) {
        return;
    }

    try {
        await fs.promises.unlink(imagePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Failed to delete stored image:', error);
        }
    }
};

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

exports.deleteHistoryItem = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const historyItem = await History.findOneAndDelete({ _id: id, userId });

        if (!historyItem) {
            return res.status(404).send({ message: 'History item not found.' });
        }

        await deleteStoredImage(historyItem);

        return res.json({ message: 'History item deleted.', id });
    } catch (error) {
        console.error('Delete History Item error:', error);
        return res.status(500).send({ message: 'Server error deleting history item.' });
    }
};

exports.deleteAllHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        const historyItems = await History.find({ userId }).lean();

        await History.deleteMany({ userId });

        await Promise.all(historyItems.map(deleteStoredImage));

        return res.json({ message: 'All history deleted.', deletedCount: historyItems.length });
    } catch (error) {
        console.error('Delete All History error:', error);
        return res.status(500).send({ message: 'Server error deleting history.' });
    }
};