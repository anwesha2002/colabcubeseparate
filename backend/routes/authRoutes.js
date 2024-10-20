const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, password } = req.body;
    const newUser = new User({ name, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
});

module.exports = router;
