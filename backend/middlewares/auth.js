const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    console.log(token);
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid token' });
    }
};

// how do i import multiple modules here?

module.exports = verifyToken;
