const mongoose = require("mongoose");

const subTaskModel = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    mainTaskId: {
        type: Number,
        required: true,
    },
    status: {
        type: Number,
        default: 0,
    },
    userId: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        required: true,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
});

const SubTask = mongoose.model("subtasks", subTaskModel);

module.exports = SubTask;
