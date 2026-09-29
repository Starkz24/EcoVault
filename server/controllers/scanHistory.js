const ScanHistory = require('../models/scanHistory.models');

const addScanHistory = async (req, res) => {
    try {
        const { itemName, points } = req.body;

        if (!itemName || typeof points !== 'number') {
            return res.status(400).json({ success: false, error: 'itemName and points are required' });
        }

        const entry = await ScanHistory.create({
            userEmail: req.user.email,
            itemName,
            points,
        });

        res.status(201).json({ success: true, data: entry });
    } catch (error) {
        console.error('Error saving scan history:', error.message);
        res.status(500).json({ success: false, error: 'Failed to save scan history' });
    }
};

const getScanHistory = async (req, res) => {
    try {
        const history = await ScanHistory.find({ userEmail: req.user.email })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error fetching scan history:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch scan history' });
    }
};

module.exports = { addScanHistory, getScanHistory };
