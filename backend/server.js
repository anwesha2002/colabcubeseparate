require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const authRouter = require('./routes/authRoutes');
const verifyToken = require('./middlewares/auth')

const app = express();
const PORT = process.env.PORT || 5012;

// this is kinda the middleware for the server
app.use(cors());
app.use(express.json());

// MongoDB connection, rn it's in my account so we need to change it later in .env
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log(`Connected to MongoDB ${process.env.MONGO_URI}`))
    .catch(err => console.error('MongoDB connection error:', err));


// Routes
app.use('/api', authRouter);

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

app.get('/api/user', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({message: "User fetch successful", data: user.toJSON()});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
});

app.get('/api/users', verifyToken, async (req, res) => {
    try {
        const users = await User.find().select('-password -tasks');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

//idk i put it 2 times cuz this wasn't workin

app.get('/api/users', verifyToken, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password -tasks');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

app.get('/api/user', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
});

app.post('/api/connect', verifyToken, async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const user = await User.findById(req.user._id);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        const tokenCost = getTokenCost(targetUser.level);

        if (user.tokens < tokenCost) {
            return res.status(400).json({ message: 'Insufficient tokens' });
        }

        if (user.connections.includes(targetUserId)) {
            return res.status(400).json({ message: 'Already connected to this user' });
        }

        user.tokens -= tokenCost;
        user.connections.push(targetUser._id);
        await user.save();

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error connecting users', error: error.message });
    }
});



app.post('/api/connect', verifyToken, async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const user = await User.findById(req.user._id);
        const targetUser = await User.findById(targetUserId);

        const tokenCost = getTokenCost(targetUser.level);

        if (user.tokens < tokenCost) {
            return res.status(400).json({ message: 'Insufficient tokens' });
        }

        user.tokens -= tokenCost;
        user.connections.push(targetUser._id);
        await user.save();

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error connecting users', error: error.message });
    }
});

app.post('/api/tasks', verifyToken, async (req, res) => {
    try {
        const { description } = req.body;
        const user = await User.findById(req.user._id);
        user.tasks.push({ description });
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error adding task', error: error.message });
    }
});

app.put('/api/tasks/:taskId', verifyToken, async (req, res) => {
    try {
        const { taskId } = req.params;
        const user = await User.findById(req.user._id);
        const task = user.tasks.id(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.completed = !task.completed;
        if (task.completed) {
            user.xp += 20;
            if (user.xp >= 120) {
                user.level += 1;
                user.xp -= 120;
            }
        } else {
            user.xp = Math.max(0, user.xp - 20);
        }

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
});

function getTokenCost(level) {
    const tokenCosts = {
        1: 5, 2: 10, 3: 15, 4: 20, 5: 30,
        10: 50, 20: 60, 30: 70, 40: 80, 50: 150, 100: 300
    };
    return tokenCosts[level] || tokenCosts[Object.keys(tokenCosts).reduce((a, b) => Math.abs(b - level) < Math.abs(a - level) ? b : a)];
}




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
