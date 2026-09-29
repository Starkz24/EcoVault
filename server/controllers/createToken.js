const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'defaultSecret');
};

const createTokenResponse = (user) => {
    const tokenPayload = {
        email: user.email,
        name: user.name,
        locality: user.locality,
        username: user.username,
        points: user.points,
        isAdmin: user.isAdmin || false
    };

    const token = generateToken(tokenPayload);
    return token;
};

module.exports = {
    createTokenResponse
};
