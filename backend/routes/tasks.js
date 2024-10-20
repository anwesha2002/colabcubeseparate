const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const router = express.Router();


router.post('/', async (req, res) => {
    const { userId, description } = req.body;
    const task = new Task({ userId, description });
    await task.save();
    res.status(201).json(task);
});

router.get('/:userId', async (req, res) => {
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
});


router.patch('/:id', async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.id, { completed: true }, { new: true });
    const user = await User.findById(task.userId);
    user.tasksCompleted += 1;

    if (user.tasksCompleted >= 5) {
        user.level += 1;
        user.tasksCompleted = 0;
    }

    await user.save();
    res.json(task);
});

module.exports = router;
