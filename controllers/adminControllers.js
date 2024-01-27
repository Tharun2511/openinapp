const asyncHandler = require("express-async-handler");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const generateToken = require("../config/jwt");
const Task = require("../models/taskModel");
const { twilioCall } = require("../cronLogic/twilioCallingLogic");

const addUser = asyncHandler(async (req, res) => {
    const { id, name, phoneNumber, priority } = req.body;

    if (!id || !name || !phoneNumber || !priority) {
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    const userIdexists = await User.findOne({ id });

    if (userIdexists) {
        res.status(400);
        throw new Error("User ID already exists, use another id");
    }

    const user = await User.create({
        id,
        name,
        phoneNumber,
        priority,
    });

    if (user) {
        res.status(201).json({
            Message: "User created successfully",
            UserDetails: {
                _id: user._id,
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                priority: user.priority,
                token: generateToken(user.id),
            },
        });
    } else {
        res.status(400);
        throw new Error("User creation failed");
    }
});

const authAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && admin.matchPassword(password)) {
        res.json({
            Message: "Admin Logged in Succesfully",
            AdminDetails: {
                _id: admin._id,
                email: admin.email,
                token: generateToken(admin._id),
            },
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

const registerAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    const AdminExists = await Admin.findOne({ email });

    if (AdminExists) {
        res.status(400);
        throw new Error(
            "Admin alreay exists with the given mail, please try different mail"
        );
    }

    const admin = await Admin.create({
        email,
        password,
    });

    if (admin) {
        res.status(201).json({
            Message: "Admin created successfully",
            AdminDetails: {
                _id: admin._id,
                email: admin.email,
                token: generateToken(admin._id),
            },
        });
    } else {
        res.status(400);
        throw new Error("Admin creation failed");
    }
});

const callUser = asyncHandler(async (req, res) => {
    try {
        const tasks = await Task.find({});
        tasks.sort(sortByPriority);
        for (let i = 0; i < tasks.length; i++) {
            if (Date.parse(tasks[i].dueDate) < Date.now()) {
                twilioCall(tasks[i]);
            }
            res.send(200);
            res.json({ Messgae: "Outdated tasks have been called" });
        }
    } catch (error) {
        throw new Error("There are no outdated tasks or try again later");
    }
});

const sortByPriority = (a, b) => {
    if (a.priority < b.priority) return -1;
    if (a.priority > b.priority) return 1;
    return 0;
};

module.exports = {
    registerAdmin,
    authAdmin,
    addUser,
    callUser,
};
