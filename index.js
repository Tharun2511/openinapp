const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const adminRoutes = require("./routes/adminRoutes");
const taskRoutes = require("./routes/taskRoutes");
const subTaskRoutes = require("./routes/subTaskRoutes");
const setTaskPriority = require("./cronLogic/taskPriorityLogic");

dotenv.config();
connectDB();
const app = express();
app.use(express.json());

// Mount the admin, task, and subtask routes at the specified URLs
app.use("/", adminRoutes);
app.use("/task", taskRoutes);
app.use("/subtask", subTaskRoutes);

setTaskPriority();

// Set the port for the server to listen on, using the environment variable PORT if available, or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port, with a callback to log that the server is running
app.listen(PORT, () => console.log("Listening on port " + PORT + "..."));
