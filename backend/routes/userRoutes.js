const express = require('express');
const User = require('../models/User');
const router = express.Router();


router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});


router.post('/connect', async (req, res) => {
    const { userId, connectingUserId } = req.body;

    const user = await User.findById(userId);
    const connectingUser = await User.findById(connectingUserId);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (connectingUser.tokenBalance < user.tokenCost) return res.status(400).json({ error: 'Not enough tokens' });


    connectingUser.tokenBalance -= user.tokenCost;
    await connectingUser.save();

    res.json({ message: `Connected with ${user.name}`, newBalance: connectingUser.tokenBalance });
});


router.get('/balance/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json({ balance: user.tokenBalance });
});

module.exports = router;
