const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

router.post("/register", limiter, register);
router.post("/login",    limiter, login);
router.get("/me",        protect, me);

module.exports = router;
