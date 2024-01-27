const mongoose = require("mongoose");

const userModel = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    priority: {
        type: Number,
        Enumerator: [0, 1, 2],
        required: true,
    },
});

const User = mongoose.model("users", userModel);

module.exports = User;
