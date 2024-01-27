const asyncHandler = require("express-async-handler");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const SubTask = require("../models/subTaskModel");

const createSubTask = asyncHandler(async (req, res) => {
    const { id, title, mainTaskId, description } = req.body;

    if (!id || !title || !mainTaskId || !description) {
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    const subTaskExist = await SubTask.findOne({ id });
    if (subTaskExist) {
        res.status(400);
        throw new Error("Subtask ID already exists, use another id");
    }

    const taskExist = await Task.findOne({ id: mainTaskId });
    if (!taskExist) {
        res.status(400);
        throw new Error(
            "The task does not exists, please create a new task or use an existing task to add subtask"
        );
    }

    const user = await User.findOne({ id: taskExist.userId });
    try {
        const subTask = await SubTask.create({
            id,
            title,
            mainTaskId,
            userId: user.id,
            description,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        const task = await Task.findOneAndUpdate(
            { id: mainTaskId },
            {
                $push: {
                    subTasksPending: subTask,
                },
            },
            { new: true }
        );
        if (subTask) {
            res.status(201).json({
                Message: "SubTask created successfully",
                NewSubTaskDetails: {
                    id: subTask.id,
                    title: subTask.title,
                    mainTaskId: subTask.task_id,
                    MainTaskName: taskExist.title,
                    UserId: user.id,
                    status: subTask.status,
                    description: subTask.description,
                    createdAt: subTask.createdAt,
                },
            });
        }
    } catch {
        res.status(400);
        throw new Error("Error in creating the subtask");
    }
});

const userSubTasks = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { taskId } = req.query;

    if (!userId) {
        res.status(400);
        throw new Error("Please enter a valid User Id");
    }

    const userExist = await User.findOne({ id: userId });
    if (!userExist) {
        res.status(400);
        throw new Error("Any user does not exists with the userId");
    }

    try {
        if (!taskId) {
            const subTasks = await SubTask.find({ userId });
            if (subTasks.length === 0) {
                res.send("No Subtasks found for the user");
                return;
            }
            res.status(200);
            res.json({
                Message: "All Subtasks for the given user are: ",
                subTasks,
            });
        } else {
            const subTasks = await SubTask.find({ userId, mainTaskId: taskId });
            if (subTasks.length === 0) {
                res.send(
                    "No Subtasks found for the user with the given Task ID"
                );
                return;
            }
            res.status(200);
            res.json({
                Message:
                    "All Subtasks for the given user with the given Task ID are: ",
                subTasks,
            });
        }
        if (subTasks.length == 0) res.send("No subtasks found for the user");
        else {
            res.status(200).json(subTasks);
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const taskSubTasks = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    if (!taskId) {
        res.status(400);
        throw new Error("Please enter a valid Task Id");
    }

    const taskExist = await Task.findOne({ id: taskId });
    if (!taskExist) {
        res.status(400);
        throw new Error("Task does not exists");
    }

    try {
        const subTasks = await SubTask.find({ mainTaskId: taskId });
        res.status(200).json(subTasks);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const UpdateSubTask = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(400);
        throw new Error("Enter a valid Subtask Id");
    }

    const passedStatus = req.body.status;
    if (passedStatus !== 0 && passedStatus !== 1) {
        res.status(400);
        throw new Error("Status must be 0(incomplete) or 1(completed)");
    }
    try {
        const subTask = await SubTask.findOne({
            id,
        });

        if (subTask.isDeleted) {
            res.status(400);
            throw new Error(
                "Subtask you are trying to update is already deleted"
            );
        }

        if (subTask.status == 1) {
            res.status(400);
            throw new Error("Subtask is already completed");
        }

        const subTaskUpdated = await SubTask.findOneAndUpdate(
            { _id: subTask._id },
            {
                $set: {
                    status: passedStatus,
                    updatedAt: Date.now(),
                },
            },
            { new: true }
        );

        if (passedStatus == 1) {
            const mainTask = await Task.findOne({
                id: subTaskUpdated.mainTaskId,
            });
            const taskUpdated = await Task.findOneAndUpdate(
                {
                    id: subTaskUpdated.mainTaskId,
                },
                {
                    $pull: {
                        subTasksPending: subTaskUpdated._id,
                    },
                    $push: {
                        subTasksCompleted: subTaskUpdated._id,
                    },
                    status:
                        mainTask.subTasksPending.length == 1
                            ? "DONE"
                            : "IN_PROGRESS",
                },
                {
                    new: true,
                }
            );
        }
        const completed = passedStatus == 1 ? " and completed" : "";
        res.json({
            Message: "Subtask Updated Succesfully",
            NewSubTask: subTask,
        });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const deleteSubTask = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(400);
        throw new Error("Enter a valid Subtask Id or Subtask does not exists");
    }

    const subTask = await SubTask.findOne({ id });
    if (!subTask) {
        res.status(400);
        throw new Error("Subtask does not exists with the given id");
    }

    if (subTask.isDeleted) {
        res.status(400);
        throw new Error("Subtask is already deleted");
    }

    try {
        const updateMainTask = await Task.findOneAndUpdate(
            { id: subTask.mainTaskId },
            {
                $pull: {
                    subTasksPending: subTask._id,
                },
            }
        );
        const subTaskDeleted = await SubTask.findOneAndUpdate(
            { id },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: Date.now(),
                },
            },
            { new: true }
        );
        res.status(200).json({
            Message: "Subtask Deleted Successfully",
            DeletedTask: subTaskDeleted,
        });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = {
    createSubTask,
    userSubTasks,
    taskSubTasks,
    UpdateSubTask,
    deleteSubTask,
};
