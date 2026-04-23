const AuditLog = require("../models/AuditLog");

const writeAuditLog = async ({ user, action, targetType, targetId, message, metadata = {} }) => {
  try {
    if (!user || !user._id) return;

    await AuditLog.create({
      user: user._id,
      actorName: user.name,
      actorEmail: user.email,
      action,
      targetType,
      targetId,
      message,
      metadata,
    });
  } catch (error) {
    // Logging failure should not block request handling.
    console.error("Audit log write failed:", error.message);
  }
};

module.exports = { writeAuditLog };
