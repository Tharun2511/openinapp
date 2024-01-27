const cron = require("node-cron");
const Task = require("../models/taskModel");

const setTaskPriority = async () => {
    cron.schedule("* 0,6,12,18 * * *", () => {
        Task.updateMany(
            {},
            {
                $set: {
                    priority: () => {
                        const days = Date.parse("$dueDate") - Date.now();
                        if (days <= 0) return 0;
                        if (days == 1 && days == 2) return 1;
                        if (days == 3 && days == 4) return 2;
                        return 3;
                    },
                },
            },
            {
                multi: true,
            }
        ).exec();
    });
};

module.exports = setTaskPriority;
