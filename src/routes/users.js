const router = require("express").Router();
const { getProfile, updateProfile, getAllUsers } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect);
router.get("/profile",  getProfile);
router.put("/profile",  updateProfile);
router.get("/",         adminOnly, getAllUsers);

module.exports = router;
