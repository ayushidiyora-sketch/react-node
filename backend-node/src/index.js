const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const errorHandler = require("./middleware/errorHandler");
const { adminLogin, sellerLogin } = require("./controllers/authController");
const User = require("./models/User");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use("/api/sellers/subscriptions/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.post("/api/admin/login", adminLogin);
app.post("/api/seller/login", sellerLogin);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

const ensureAdminUser = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin seed.");
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });

  if (existing) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name: "ShopO Admin",
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: "admin",
  });

  console.log("Default admin user created");
};

const startServer = async () => {
  await connectDB();
  await ensureAdminUser();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer();
