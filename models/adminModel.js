const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const adminModel = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

adminModel.methods.matchPassword = function (enteredPassword) {
    return enteredPassword === this.password;
};

const Admin = mongoose.model("admins", adminModel);

module.exports = Admin;
