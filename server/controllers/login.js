const bcrypt = require('bcrypt');
const User = require('../models/user.models');
const { createTokenResponse } = require('./createToken');

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const token = createTokenResponse(user);
        // console.log(token);
        res.status(200).json({ token });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { loginUser };
