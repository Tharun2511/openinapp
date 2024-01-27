const cron = require("node-cron");
const Task = require("../models/taskModel");

const setTaskPriority = async () => {
    cron.schedule("* * * * * *", () => {
        Task.updateMany(
            {},
            { $set: { priority: Date.now("$dueDate") - Date.now() } },
            {
                multi: true,
            }
        ).exec();
    });
};

module.exports = setTaskPriority;
