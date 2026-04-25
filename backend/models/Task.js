const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a task title'],
        trim: true
    },
    description: String,
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Completed', 'On Hold'],
        default: 'To Do'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    deadline: Date,
    completedAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
