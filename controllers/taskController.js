// Import necessary modules
const asyncHandler = require("express-async-handler");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const generateToken = require("../config/jwt");
const SubTask = require("../models/subTaskModel");
const _ = require("lodash");

// Create a new task
const createTask = asyncHandler(async (req, res) => {
    // Destructure the required fields from the request body
    const { id, title, userId, dueDate, description } = req.body;

    // Check if any required field is missing
    if (!id || !title || !userId || !dueDate || !description) {
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    // Check if the task id already exists
    const taskIdExists = await Task.findOne({ id });
    if (taskIdExists) {
        res.status(400);
        throw new Error("Task ID already exists, use another id");
    }

    // Check if the user exists
    const userExists = await User.findOne({ id: userId });
    if (!userExists) {
        res.status(400);
        throw new Error(
            "The user you are trying to assign task does not exists"
        );
    }

    let priority = 3;
    const days = Math.ceil(
        (Date.parse(dueDate) - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days <= 0) priority = 0;
    else if (days == 1 || days == 2) priority = 1;
    else if (days == 3 || days == 4) priority = 2;

    // Create the task with the provided details
    const task = await Task.create({
        id,
        title,
        userId,
        priority,
        dueDate,
        description,
    });

    // Populate the user details for the task
    const displayTask = await task.populate("userId", "name");

    // If task is created successfully, return the details
    if (displayTask) {
        res.status(201).json({
            Message: "Task created successfully",
            TaskDetails: {
                _id: displayTask._id,
                id: displayTask.id,
                title: displayTask.title,
                userId: displayTask.userId,
                userName: userExists.name,
                priority: displayTask.priority,
                dueDate: displayTask.dueDate,
                status: displayTask.status,
                description: displayTask.description,
                token: generateToken(displayTask._id),
            },
        });
    } else {
        res.status(400);
        throw new Error("Error in creating the task");
    }
});

// Get all tasks
const allTasks = asyncHandler(async (req, res) => {
    // Find all tasks
    const tasks = await Task.find({});
    // If no tasks found, return a message
    if (tasks.length == 0) {
        res.send("No tasks found");
    } else {
        // Return all tasks
        res.status(200).json({ Message: "All tasks are: ", Tasks: tasks });
    }
});

// Get tasks for a specific user with given priority
const userTasks = asyncHandler(async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        res.status(400);
        throw new Error("Please enter a valid User Id");
    }
    try {
        const userTasks = await Task.find({ userId });
        if (userTasks.length === 0)
            throw new Error(
                "No tasks found for the user or User does not exists"
            );

        const priority = req.query.priority;
        const dueDate = req.query.dueDate;
        const page = req.query.page || 1;
        const limit = req.query.limit || 3;

        if (!priority && !dueDate) {
            res.status(200);
            res.json({
                Message: "All user tasks are: ",
                Page: page,
                Tasks: Paginate(userTasks, page, limit),
            });
        }

        const userPriorityTasks = [];
        if (priority) {
            const tasks = userTasks.filter((task) => task.priority == priority);
            userPriorityTasks.push(...tasks);
            if (userPriorityTasks.length == 0)
                throw new Error(
                    "No tasks found for the user with the given priority"
                );
            if (!dueDate) {
                res.status(200);
                res.json({
                    Messgae: "User tasks with priority are: ",
                    Page: page,
                    Tasks: Paginate(userPriorityTasks, page, limit),
                });
            }
        }

        if (dueDate) {
            const userDueDateTasks = (
                priority ? userPriorityTasks : userTasks
            ).filter((task) => Date.parse(task.dueDate) == Date.parse(dueDate));
            if (userDueDateTasks.length == 0) {
                throw new Error(
                    "No tasks found for the user with the given priority and due date"
                );
            }
            res.status(200);
            if (!priority)
                res.json({
                    Message: "User tasks with due date are: ",
                    Page: page,
                    Tasks: Paginate(userDueDateTasks, page, limit),
                });
            else
                res.json({
                    Message: "User tasks with priority and due date are: ",
                    Page: page,
                    Tasks: Paginate(userDueDateTasks, page, limit),
                });
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// Update a task
const UpdateTask = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Check if a valid task id is provided
    if (!id) {
        res.status(400);
        throw new Error("Enter a valid Task Id");
    }
    try {
        // Find and update the task details
        const _id = await Task.findOne({ id });
        const task = await Task.findOneAndUpdate(
            _id,
            { $set: req.body },
            { new: true }
        );
        // Return the updated task details
        res.json({ Message: "Task Updated Succesfully", NewTask: task });
    } catch (error) {
        res.json(400);
        throw new Error(error.message);
    }
});

// Delete a task
const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(400);
        throw new Error("Enter a valid Task Id or Task does not exists");
    }

    const taskExist = await Task.findOne({ id });
    if (!taskExist) {
        res.status(400);
        throw new Error("Task does not exists or enter a valid task ID");
    }

    if (taskExist.isDeleted) {
        res.status(400);
        throw new Error("The task is already deleted");
    }

    try {
        const task = await Task.findOneAndUpdate(
            { _id: taskExist._id },
            {
                isDeleted: true,
            },
            { new: true }
        );
        const subTasks = await SubTask.updateMany(
            { mainTaskId: id },
            { $set: { isDeleted: true } },
            { new: true }
        );

        res.status(200);
        res.json({ Message: "Task Deleted Successfully", DeletedTask: task });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const Paginate = (tasks, pageNum, limit) => {
    const startIndex = (pageNum - 1) * limit;
    return _(tasks).slice(startIndex).take(limit).value();
};

module.exports = {
    allTasks,
    userTasks,
    createTask,
    UpdateTask,
    deleteTask,
};
