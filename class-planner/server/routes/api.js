const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let readData, writeData;

// Ensure these functions are passed from server.js or another utility file
module.exports = function(serverReadData, serverWriteData) {
    readData = serverReadData;
    writeData = serverWriteData;

    // Register
    router.post('/register', async (req, res) => {
        const { username, password } = req.body;
        const data = readData();

        if (data.users.find(user => user.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            data.users.push({ username, password: hashedPassword });
            writeData(data);
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to register user' });
        }
    });

    // Login
    router.post('/login', async (req, res) => {
        const { username, password } = req.body;
        const data = readData();
        const user = data.users.find(user => user.username === username);

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'your_jwt_secret_key');
        res.json({ token });
    });

    // Middleware to verify token
    const authenticate = (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            req.username = decoded.username;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };

    // Get schedule
    router.get('/schedule', authenticate, (req, res) => {
        const data = readData();
        const schedule = data.schedules.find(sched => sched.username === req.username);
        res.json(schedule || { classes: [], connections: [], semesterAssignments: {} });
    });

    // Save schedule
    router.post('/schedule', authenticate, (req, res) => {
        const data = readData();
        const scheduleIndex = data.schedules.findIndex(sched => sched.username === req.username);

        if (req.body.classes.length === 0 && req.body.connections.length === 0) {
            // If schedule is empty, remove it completely
            if (scheduleIndex !== -1) {
                data.schedules.splice(scheduleIndex, 1);
            }
        } else {
            // Otherwise update or create schedule
            if (scheduleIndex !== -1) {
                data.schedules[scheduleIndex] = { ...req.body, username: req.username };
            } else {
                data.schedules.push({ ...req.body, username: req.username });
            }
        }

        writeData(data);
        res.json({ message: 'Schedule saved successfully' });
    });

    return router;
};