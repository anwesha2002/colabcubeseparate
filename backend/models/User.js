const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: Number, default: 1 },
    tokenBalance: { type: Number, default: 1000 },
    tasksCompleted: { type: Number, default: 0 },
    password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);

