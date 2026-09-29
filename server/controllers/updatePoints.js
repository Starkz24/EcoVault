const User = require('../models/user.models');

const updatePoints = async (req, res) => {
    try {
        const { email } = req.user;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const pointsToAdd = req.body.points;
        if (typeof pointsToAdd !== 'number' || pointsToAdd <= 0) {
            return res.status(400).json({ error: 'Invalid points value' });
        }

        user.points += pointsToAdd;
        await user.save();

        res.json({ points: user.points });

    } catch (error) {
        console.error('Error updating points:', error.message);
        res.status(500).json({ error: 'Failed to update points' });
    }
};

module.exports = { updatePoints };
