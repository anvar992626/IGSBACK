const router = require("express").Router();
const { createOrder, getOrders, getOrder, updateOrderStatus } = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect);
router.post("/",         createOrder);
router.get("/",          getOrders);
router.get("/:id",       getOrder);
router.put("/:id/status", adminOnly, updateOrderStatus);

module.exports = router;
