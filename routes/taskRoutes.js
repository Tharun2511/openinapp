// Import the express router
const router = require("express").Router();
// Import the necessary controller functions
const {
    createTask,
    allTasks,
    UpdateTask,
    deleteTask,
    userTasks,
} = require("../controllers/taskController");
// Import the authentication middleware
const { protect } = require("../middleware/authMiddleware");

// Define routes and associate them with the corresponding controller functions and authentication middleware
router.route("/create-task").post(protect, createTask); // Route for creating a task
router.route("/get-tasks").get(protect, userTasks); // Route for retrieving user-specific tasks
router.route("/get-tasks").get(protect, allTasks); // Route for retrieving all tasks
router.route("/update-task").put(protect, UpdateTask); // Route for updating a task
router.route("/delete-task").delete(protect, deleteTask); // Route for deleting a task

// Export the router
module.exports = router;