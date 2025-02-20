const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    classes: [String],
    connections: [{
        class1: String,
        class2: String,
        type: String
    }],
    semesterAssignments: {
        type: Map,
        of: Number
    },
    semesterTitles: {
        type: Map,
        of: String
    }
});

module.exports = mongoose.model('Schedule', scheduleSchema);