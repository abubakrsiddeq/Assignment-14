const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getMyLogs, clearMyLogs } = require("../controllers/logController");

router.use(protect);
router.route("/").get(getMyLogs).delete(clearMyLogs);

module.exports = router;
