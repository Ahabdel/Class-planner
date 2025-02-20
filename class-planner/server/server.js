const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const dataFilePath = path.join(__dirname, 'data.json');

// Helper function to read data from JSON file
function readData() {
    try {
        return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    } catch (error) {
        console.error('Error reading data file:', error);
        return { users: [], schedules: [] };
    }
}

// Helper function to write data to JSON file
function writeData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// Initialize API routes with data functions
app.use('/api', require('./routes/api')(readData, writeData));

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

const port = 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log('Access the application at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co');
});