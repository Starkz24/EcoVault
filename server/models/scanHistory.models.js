const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    itemName: { type: String, required: true },
    points: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
