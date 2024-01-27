const router = require("express").Router();
const { createSubTask, userSubTasks, taskSubTasks, UpdateSubTask, deleteSubTask } = require("../controllers/subTaskControllers");
const { protect } = require("../middleware/authMiddleware");


router.route("/create-subtask").post(protect, createSubTask);
router.route("/get-subtasks/:userId").get(protect, userSubTasks);
router.route("/update-subtask").put(protect, UpdateSubTask);
router.route("/delete-subtask").delete(protect, deleteSubTask);

module.exports = router;
