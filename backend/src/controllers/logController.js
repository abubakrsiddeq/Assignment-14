const AuditLog = require("../models/AuditLog");

const getMyLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(120)
      .lean();

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const clearMyLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({ user: req.user._id });
    res.json({ message: "Logs cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMyLogs, clearMyLogs };
