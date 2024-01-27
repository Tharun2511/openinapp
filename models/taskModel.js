const mongoose = require("mongoose");

const taskModel = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    userId: {
        type: Number,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    subTasksPending: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subtasks",
        },
    ],
    subTasksCompleted: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subtasks",
        },
    ],
    priority: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        Enumerator: ["TODO", "IN_PROGRESS", "DONE"],
        default: "TODO",
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
        required: true,
    },
});

const Task = mongoose.model("tasks", taskModel);

module.exports = Task;
