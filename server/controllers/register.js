const bcrypt = require('bcrypt');
const User = require('../models/user.models'); 

const registerUser = async (req, res) => {
    try {
        const { name, email, password, username, locality } = req.body;

        if (!name || !email || !password || !username || !locality) {
            return res.status(400).json({ status: 'error', error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'error', error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username,
            locality,
            points: 0
        });

        await newUser.save();

        res.json({ status: 'ok' });
        console.log('User registered:', newUser);

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ status: 'error', error: 'Internal server error' });
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, username, locality, adminSecret } = req.body;

        if (!name || !email || !password || !username || !locality || !adminSecret) {
            return res.status(400).json({ status: 'error', error: 'All fields are required' });
        }

        if (adminSecret !== process.env.ADMIN_SIGNUP_SECRET) {
            return res.status(403).json({ status: 'error', error: 'Invalid admin signup code' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'error', error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username,
            locality,
            points: 0,
            isAdmin: true
        });

        await newUser.save();

        res.json({ status: 'ok' });

    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ status: 'error', error: 'Internal server error' });
    }
};

module.exports = { registerUser, registerAdmin };
