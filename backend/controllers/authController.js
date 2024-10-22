const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/User")

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // check if user already exist
        const exist = await User.userExists(email)
        if (exist) return res.status(400).json({ message: 'User already exists' })
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.status(201).json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
}


module.exports = {
    register
}
