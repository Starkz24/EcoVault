const User = require('../models/user.models');
const Event = require('../models/event.models');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
};

const toggleAdminRole = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.email === req.user.email) {
            return res.status(400).json({ success: false, error: "You can't change your own admin status" });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.json({ success: true, data: { id: user._id, isAdmin: user.isAdmin } });
    } catch (error) {
        console.error('Error toggling admin role:', error.message);
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
};

const deleteEventAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error.message);
        res.status(500).json({ success: false, error: 'Failed to delete event' });
    }
};

module.exports = { getAllUsers, toggleAdminRole, deleteEventAdmin };
