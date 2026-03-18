const express = require("express");

const {
  getAdminNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, authorizeRoles("admin", "seller"), getAdminNotifications);
router.get("/unread-count", authenticate, authorizeRoles("admin", "seller"), getUnreadNotificationsCount);
router.patch("/:id/read", authenticate, authorizeRoles("admin", "seller"), markNotificationAsRead);
router.patch("/read-all", authenticate, authorizeRoles("admin", "seller"), markAllNotificationsAsRead);

module.exports = router;
