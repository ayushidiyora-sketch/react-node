const Notification = require("../models/Notification");

const allowedActions = ["add", "edit", "delete"];

const buildRoleScopeQuery = (req) => {
  if (req.user?.role === "seller") {
    return { sellerId: req.user.id };
  }

  return {};
};

const getAdminNotifications = async (req, res, next) => {
  try {
    const { action, isRead, limit } = req.query;
    const query = buildRoleScopeQuery(req);

    if (action && allowedActions.includes(String(action))) {
      query.action = String(action);
    }

    if (isRead === "true") {
      query.isRead = true;
    }

    if (isRead === "false") {
      query.isRead = false;
    }

    const parsedLimit = Number(limit);
    const hasLimit = Number.isInteger(parsedLimit) && parsedLimit > 0;

    let cursor = Notification.find(query).sort({ createdAt: -1 });

    if (hasLimit) {
      cursor = cursor.limit(parsedLimit);
    }

    const items = await cursor;

    return res.status(200).json({ success: true, items });
  } catch (error) {
    return next(error);
  }
};

const getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      ...buildRoleScopeQuery(req),
      isRead: false,
    });
    return res.status(200).json({ success: true, item: { count } });
  } catch (error) {
    return next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const query = {
      _id: req.params.id,
      ...buildRoleScopeQuery(req),
    };

    const item = await Notification.findOne(query);

    if (!item) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    item.isRead = true;
    await item.save();

    return res.status(200).json({ success: true, message: "Notification marked as read", item });
  } catch (error) {
    return next(error);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        ...buildRoleScopeQuery(req),
        isRead: false,
      },
      { $set: { isRead: true } },
    );
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
