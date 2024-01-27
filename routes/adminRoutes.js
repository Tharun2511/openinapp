const router = require("express").Router();
const {
    addUser,
    authAdmin,
    registerAdmin,
    callUser,
} = require("../controllers/adminControllers");
const { protect } = require("../middleware/authMiddleware");

router.route("/admin-register").post(registerAdmin);
router.route("/admin-login").post(authAdmin);
router.route("/add-user").post(protect, addUser);
router.route("/twilio-call").get(protect,callUser);

module.exports = router;
