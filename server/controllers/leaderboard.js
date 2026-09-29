const User = require('../models/user.models');
const ScanHistory = require('../models/scanHistory.models');

const getAllTimeLeaderboard = async () => {
    const users = await User.find({ isAdmin: { $ne: true } }).sort({ points: -1 }).select('username points locality').exec();

    return users.map(user => ({
        username: user.username,
        points: user.points,
        location: user.locality
    }));
};

const getPeriodLeaderboard = async (startDate) => {
    const aggregated = await ScanHistory.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$userEmail', points: { $sum: '$points' } } },
        { $sort: { points: -1 } },
    ]);

    const emails = aggregated.map(entry => entry._id);
    const users = await User.find({ email: { $in: emails }, isAdmin: { $ne: true } }).select('email username locality');
    const userByEmail = Object.fromEntries(users.map(u => [u.email, u]));

    return aggregated
        .filter(entry => userByEmail[entry._id])
        .map(entry => ({
            username: userByEmail[entry._id].username,
            points: entry.points,
            location: userByEmail[entry._id].locality
        }));
};

const getLeaderboard = async (req, res) => {
    try {
        const { period } = req.query;
        let leaderboard;

        if (period === 'today') {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            leaderboard = await getPeriodLeaderboard(startOfToday);
        } else if (period === 'month') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            leaderboard = await getPeriodLeaderboard(startOfMonth);
        } else {
            leaderboard = await getAllTimeLeaderboard();
        }

        res.json(leaderboard);

    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
    }

};

module.exports = { getLeaderboard };
