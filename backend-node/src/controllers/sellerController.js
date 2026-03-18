const bcrypt = require("bcryptjs");
const Stripe = require("stripe");

const SellerApplication = require("../models/SellerApplication");
const SellerBrand = require("../models/SellerBrand");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const SellerProfile = require("../models/SellerProfile");
const SellerSubscriptionRequest = require("../models/SellerSubscriptionRequest");
const User = require("../models/User");

const generateTemporaryPassword = () => {
  const random = Math.random().toString(36).slice(-6).toUpperCase();
  return `Seller@${random}`;
};

const subscriptionPlans = [
  { planName: "Free", productLimit: 1, brandLimit: 1, durationDays: 30, price: 0 },
  { planName: "Basic", productLimit: 10, brandLimit: 5, durationDays: 30, price: 999 },
  { planName: "Starter", productLimit: 20, brandLimit: 15, durationDays: 30, price: 1499 },
  { planName: "Business", productLimit: 50, brandLimit: 50, durationDays: 30, price: 2999 },
  { planName: "Premium", productLimit: -1, brandLimit: 70, durationDays: 30, price: 4999 },
];

const getPlanByName = (planName) =>
  subscriptionPlans.find((item) => item.planName.toLowerCase() === String(planName || "").toLowerCase());

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    const error = new Error("Stripe is not configured on the server");
    error.statusCode = 500;
    throw error;
  }

  return new Stripe(secretKey);
};

const getPlanDateRange = (durationDays, startsAt = new Date()) => {
  const startDate = new Date(startsAt);
  const expiryDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  return { startDate, expiryDate };
};

const applySellerSubscriptionToProfile = async (subscriptionRequest) => {
  const user = await User.findById(subscriptionRequest.seller);

  if (!user) {
    return;
  }

  const profile = await ensureSellerProfile(user);
  profile.currentPlan = {
    planName: subscriptionRequest.planName,
    productLimit: subscriptionRequest.productLimit,
    brandLimit: subscriptionRequest.brandLimit,
    durationDays: subscriptionRequest.durationDays,
    price: subscriptionRequest.price,
    startsAt: subscriptionRequest.startDate,
    expiresAt: subscriptionRequest.expiryDate,
    status: "active",
    paymentStatus: "paid",
  };

  await profile.save();
};

const ensureSellerProfile = async (user, defaults = {}) => {
  let profile = await SellerProfile.findOne({ seller: user._id });

  if (profile) {
    return profile;
  }

  const freePlan = getPlanByName("Free");
  const startsAt = new Date();
  const expiresAt = new Date(startsAt.getTime() + freePlan.durationDays * 24 * 60 * 60 * 1000);

  profile = await SellerProfile.create({
    seller: user._id,
    sellerName: defaults.sellerName || user.name,
    email: defaults.email || user.email,
    phoneNumber: defaults.phoneNumber || "",
    address: defaults.address || "",
    companyName: defaults.companyName || "",
    brandName: defaults.brandName || "",
    gstNumber: defaults.gstNumber || "",
    websiteUrl: defaults.websiteUrl || "",
    companyInfo: {
      brandName: defaults.brandName || "",
      companyName: defaults.companyName || "",
      phoneNumber: defaults.phoneNumber || "",
      email: defaults.email || user.email,
      address: defaults.address || "",
      city: defaults.city || "",
      state: defaults.state || "",
      country: defaults.country || "",
      pincode: defaults.pincode || "",
      gstNumber: defaults.gstNumber || "",
      websiteUrl: defaults.websiteUrl || "",
    },
    currentPlan: {
      planName: freePlan.planName,
      productLimit: freePlan.productLimit,
      brandLimit: freePlan.brandLimit,
      durationDays: freePlan.durationDays,
      price: freePlan.price,
      startsAt,
      expiresAt,
      status: "active",
      paymentStatus: "free",
    },
  });

  return profile;
};

const updatePlanStatusIfExpired = async (profile) => {
  if (!profile?.currentPlan?.expiresAt) {
    return profile;
  }

  if (new Date(profile.currentPlan.expiresAt).getTime() < Date.now() && profile.currentPlan.status !== "expired") {
    profile.currentPlan.status = "expired";
    await profile.save();
  }

  return profile;
};

const hasReachedLimit = (limit, count) => limit !== -1 && count >= limit;

const notificationActionMap = {
  add: "added",
  edit: "updated",
  delete: "deleted",
};

const createSellerActivityNotification = async ({
  seller,
  action,
  itemType,
  itemId,
  itemName,
}) => {
  await Notification.create({
    sellerId: seller._id,
    sellerName: seller.name,
    action,
    itemType,
    itemId,
    itemName,
    message: `Seller ${seller.name} ${notificationActionMap[action]} the ${itemType}: ${itemName}`,
  });
};

const createSeller = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password, confirmPassword } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Email, Phone Number, Password, and Confirm Password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password must match",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "seller",
    });

    await ensureSellerProfile(user, {
      sellerName: fullName.trim(),
      email: normalizedEmail,
      phoneNumber: phoneNumber.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Seller registered successfully",
      item: {
        id: user._id,
        fullName: user.name,
        email: user.email,
        phoneNumber: phoneNumber.trim(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getSellerApplications = async (_req, res, next) => {
  try {
    const items = await SellerApplication.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    return next(error);
  }
};

const applySeller = async (req, res, next) => {
  try {
    const {
      fullName,
      businessName,
      email,
      phone,
      taxId,
      address,
      message,
    } = req.body;
    const files = req.files || [];
    const kycDocuments = files.map(file => `/uploads/sellers/${file.filename}`);

    if (!fullName || !businessName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name, business name, email, and phone are required",
      });
    }

    const existingPending = await SellerApplication.findOne({
      email: email.toLowerCase().trim(),
      status: "pending",
    });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: "A pending seller application already exists for this email",
      });
    }

    const item = await SellerApplication.create({
      fullName: fullName.trim(),
      businessName: businessName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      taxId: taxId?.trim() || "",
      address: address?.trim() || "",
      message: message?.trim() || "",
      kycDocuments,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Seller application submitted",
      item,
    });
  } catch (error) {
    return next(error);
  }
};

const updateSellerApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    const item = await SellerApplication.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Seller application not found",
      });
    }

    item.status = status;

    let credentials;

    if (status === "approved") {
      let sellerUser = await User.findOne({ email: item.email.toLowerCase().trim() });

      if (!sellerUser) {
        const generatedPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        sellerUser = await User.create({
          name: item.fullName,
          email: item.email.toLowerCase().trim(),
          password: hashedPassword,
          role: "seller",
          mustChangePassword: true,
        });

        credentials = {
          email: sellerUser.email,
          password: generatedPassword,
        };

        await ensureSellerProfile(sellerUser, {
          sellerName: item.fullName,
          email: item.email,
          phoneNumber: item.phone,
          address: item.address,
          companyName: item.businessName,
          brandName: item.businessName,
          gstNumber: item.taxId,
        });
      } else if (sellerUser.role !== "seller") {
        sellerUser.role = "seller";
        await sellerUser.save();
      }

      await ensureSellerProfile(sellerUser, {
        sellerName: item.fullName,
        email: item.email,
        phoneNumber: item.phone,
        address: item.address,
        companyName: item.businessName,
        brandName: item.businessName,
        gstNumber: item.taxId,
      });
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Seller application status updated",
      item,
      credentials,
    });
  } catch (error) {
    return next(error);
  }
};

const getSellerDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const profile = await ensureSellerProfile(user);
    await updatePlanStatusIfExpired(profile);

    const [productsCount, brandsCount] = await Promise.all([
      Product.countDocuments({ submittedBy: user._id, submittedByRole: "seller" }),
      SellerBrand.countDocuments({ seller: user._id }),
    ]);

    const recentProducts = await Product.find({ submittedBy: user._id, submittedByRole: "seller" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name status price createdAt");

    return res.status(200).json({
      success: true,
      item: {
        totalProducts: productsCount,
        totalBrands: brandsCount,
        subscriptionPlan: profile.currentPlan.planName,
        planExpiryDate: profile.currentPlan.expiresAt,
        recentProducts,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getSellerProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const profile = await ensureSellerProfile(user);
    await updatePlanStatusIfExpired(profile);

    return res.status(200).json({ success: true, item: profile });
  } catch (error) {
    return next(error);
  }
};

const updateSellerProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const profile = await ensureSellerProfile(user);
    const {
      profileImage,
      sellerName,
      email,
      phoneNumber,
      address,
      companyName,
      brandName,
      gstNumber,
      websiteUrl,
    } = req.body;

    if (profileImage !== undefined) profile.profileImage = String(profileImage).trim();
    if (sellerName !== undefined) {
      profile.sellerName = String(sellerName).trim();
      user.name = String(sellerName).trim();
    }
    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const existingEmail = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });

      if (existingEmail) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }

      profile.email = normalizedEmail;
      user.email = normalizedEmail;
    }
    if (phoneNumber !== undefined) profile.phoneNumber = String(phoneNumber).trim();
    if (address !== undefined) profile.address = String(address).trim();
    if (companyName !== undefined) profile.companyName = String(companyName).trim();
    if (brandName !== undefined) profile.brandName = String(brandName).trim();
    if (gstNumber !== undefined) profile.gstNumber = String(gstNumber).trim();
    if (websiteUrl !== undefined) profile.websiteUrl = String(websiteUrl).trim();

    await user.save();
    await profile.save();

    return res.status(200).json({ success: true, message: "Seller profile updated", item: profile });
  } catch (error) {
    return next(error);
  }
};

const getSellerCompanyInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const profile = await ensureSellerProfile(user);
    return res.status(200).json({ success: true, item: profile.companyInfo });
  } catch (error) {
    return next(error);
  }
};

const updateSellerCompanyInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const profile = await ensureSellerProfile(user);
    const {
      brandName,
      companyName,
      phoneNumber,
      email,
      address,
      city,
      state,
      country,
      pincode,
      gstNumber,
      websiteUrl,
    } = req.body;

    profile.companyInfo = {
      ...profile.companyInfo,
      brandName: brandName !== undefined ? String(brandName).trim() : profile.companyInfo.brandName,
      companyName: companyName !== undefined ? String(companyName).trim() : profile.companyInfo.companyName,
      phoneNumber: phoneNumber !== undefined ? String(phoneNumber).trim() : profile.companyInfo.phoneNumber,
      email: email !== undefined ? String(email).trim().toLowerCase() : profile.companyInfo.email,
      address: address !== undefined ? String(address).trim() : profile.companyInfo.address,
      city: city !== undefined ? String(city).trim() : profile.companyInfo.city,
      state: state !== undefined ? String(state).trim() : profile.companyInfo.state,
      country: country !== undefined ? String(country).trim() : profile.companyInfo.country,
      pincode: pincode !== undefined ? String(pincode).trim() : profile.companyInfo.pincode,
      gstNumber: gstNumber !== undefined ? String(gstNumber).trim() : profile.companyInfo.gstNumber,
      websiteUrl: websiteUrl !== undefined ? String(websiteUrl).trim() : profile.companyInfo.websiteUrl,
    };

    if (brandName !== undefined) profile.brandName = String(brandName).trim();
    if (companyName !== undefined) profile.companyName = String(companyName).trim();
    if (phoneNumber !== undefined) profile.phoneNumber = String(phoneNumber).trim();
    if (gstNumber !== undefined) profile.gstNumber = String(gstNumber).trim();
    if (websiteUrl !== undefined) profile.websiteUrl = String(websiteUrl).trim();

    await profile.save();
    return res.status(200).json({ success: true, message: "Company info updated", item: profile.companyInfo });
  } catch (error) {
    return next(error);
  }
};

const getSubscriptionPlans = async (_req, res) => {
  res.status(200).json({ success: true, items: subscriptionPlans });
};

const createSubscriptionRequest = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const { planName } = req.body;
    const plan = getPlanByName(planName);

    if (!plan || plan.planName === "Free") {
      return res.status(400).json({ success: false, message: "Please choose a valid paid plan" });
    }

    const existingPending = await SellerSubscriptionRequest.findOne({ seller: user._id, status: "pending" });

    if (existingPending) {
      return res.status(409).json({ success: false, message: "A pending subscription request already exists" });
    }

    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const item = await SellerSubscriptionRequest.create({
      seller: user._id,
      sellerName: user.name,
      planName: plan.planName,
      productLimit: plan.productLimit,
      brandLimit: plan.brandLimit,
      durationDays: plan.durationDays,
      price: plan.price,
      startDate,
      expiryDate,
      paymentStatus: "Pending",
      status: "pending",
    });

    return res.status(201).json({ success: true, message: "Subscription request submitted", item });
  } catch (error) {
    return next(error);
  }
};

const createSubscriptionCheckoutSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const { planName, successUrl, cancelUrl } = req.body;
    const plan = getPlanByName(planName);

    if (!plan || plan.planName === "Free") {
      return res.status(400).json({ success: false, message: "Please choose a valid paid plan" });
    }

    const stripe = getStripeClient();
    const normalizedSuccessUrl = String(successUrl || "").trim();
    const normalizedCancelUrl = String(cancelUrl || "").trim();

    if (!normalizedSuccessUrl || !normalizedCancelUrl) {
      return res.status(400).json({ success: false, message: "successUrl and cancelUrl are required" });
    }

    let item = await SellerSubscriptionRequest.findOne({ seller: user._id, status: "pending" });
    const { startDate, expiryDate } = getPlanDateRange(plan.durationDays);

    if (item && item.paymentStatus === "Paid") {
      return res.status(409).json({ success: false, message: "A paid subscription request is already pending activation" });
    }

    if (!item) {
      item = await SellerSubscriptionRequest.create({
        seller: user._id,
        sellerName: user.name,
        planName: plan.planName,
        productLimit: plan.productLimit,
        brandLimit: plan.brandLimit,
        durationDays: plan.durationDays,
        price: plan.price,
        startDate,
        expiryDate,
        paymentStatus: "Pending",
        paymentGateway: "stripe",
        currency: "inr",
        status: "pending",
      });
    } else {
      item.planName = plan.planName;
      item.productLimit = plan.productLimit;
      item.brandLimit = plan.brandLimit;
      item.durationDays = plan.durationDays;
      item.price = plan.price;
      item.startDate = startDate;
      item.expiryDate = expiryDate;
      item.paymentStatus = "Pending";
      item.paymentGateway = "stripe";
      item.currency = "inr";
      item.status = "pending";
      await item.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      success_url: normalizedSuccessUrl,
      cancel_url: normalizedCancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: Math.round(plan.price * 100),
            product_data: {
              name: `${plan.planName} Seller Subscription`,
              description: `${plan.durationDays} days, ${plan.productLimit === -1 ? "Unlimited" : plan.productLimit} products, ${plan.brandLimit} brands`,
            },
          },
        },
      ],
      metadata: {
        subscriptionRequestId: item._id.toString(),
        sellerId: user._id.toString(),
        planName: plan.planName,
      },
    });

    item.stripeCheckoutSessionId = session.id;
    item.stripeCustomerEmail = user.email;
    await item.save();

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      requestId: item._id,
    });
  } catch (error) {
    return next(error);
  }
};

const handleSubscriptionWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({ success: false, message: "Stripe webhook secret is not configured" });
    }

    const stripe = getStripeClient();
    const signature = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error) {
      return res.status(400).json({ success: false, message: `Webhook signature verification failed: ${error.message}` });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const subscriptionRequestId = session?.metadata?.subscriptionRequestId;
      const item = subscriptionRequestId
        ? await SellerSubscriptionRequest.findById(subscriptionRequestId)
        : await SellerSubscriptionRequest.findOne({ stripeCheckoutSessionId: session.id });

      if (item && session.payment_status === "paid") {
        const { startDate, expiryDate } = getPlanDateRange(item.durationDays);
        item.startDate = startDate;
        item.expiryDate = expiryDate;
        item.paymentStatus = "Paid";
        item.status = "approved";
        item.paymentGateway = "stripe";
        item.currency = session.currency || item.currency || "inr";
        item.stripeCheckoutSessionId = session.id || item.stripeCheckoutSessionId;
        item.stripePaymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : item.stripePaymentIntentId;
        item.stripeCustomerEmail = session.customer_details?.email || item.stripeCustomerEmail;
        item.paidAt = new Date();
        await item.save();

        await applySellerSubscriptionToProfile(item);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const item = await SellerSubscriptionRequest.findOne({ stripeCheckoutSessionId: session.id, status: "pending" });

      if (item && item.paymentStatus !== "Paid") {
        item.paymentStatus = "Rejected";
        item.status = "rejected";
        await item.save();
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return next(error);
  }
};

const getMySubscriptionRequests = async (req, res, next) => {
  try {
    const items = await SellerSubscriptionRequest.find({ seller: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, items });
  } catch (error) {
    return next(error);
  }
};

const getAdminSubscriptionRequests = async (_req, res, next) => {
  try {
    const items = await SellerSubscriptionRequest.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, items });
  } catch (error) {
    return next(error);
  }
};

const updateAdminSubscriptionRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(String(status))) {
      return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
    }

    const item = await SellerSubscriptionRequest.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Subscription request not found" });
    }

    item.status = status;
    item.paymentStatus = status === "approved" ? "Paid" : "Rejected";
    await item.save();

    if (status === "approved") {
      await applySellerSubscriptionToProfile(item);
    }

    return res.status(200).json({ success: true, message: "Subscription request updated", item });
  } catch (error) {
    return next(error);
  }
};

const deleteAdminSubscriptionRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await SellerSubscriptionRequest.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Subscription request not found" });
    }

    await item.deleteOne();
    return res.status(200).json({ success: true, message: "Subscription request deleted" });
  } catch (error) {
    return next(error);
  }
};

const getSellerUsers = async (_req, res, next) => {
  try {
    const sellerUsers = await User.find({ role: "seller" }).sort({ createdAt: -1 });
    const profiles = await SellerProfile.find({ seller: { $in: sellerUsers.map((user) => user._id) } });
    const profileMap = new Map(profiles.map((profile) => [profile.seller.toString(), profile]));

    const items = sellerUsers.map((user) => {
      const profile = profileMap.get(user._id.toString());
      return {
        id: user._id,
        sellerName: user.name,
        email: user.email,
        profileImage: profile?.profileImage || "",
        phone: profile?.phoneNumber || profile?.companyInfo?.phoneNumber || "",
        companyName: profile?.companyName || profile?.companyInfo?.companyName || "",
        planName: profile?.currentPlan?.planName || "Free",
        status: profile?.currentPlan?.status || "active",
      };
    });

    return res.status(200).json({ success: true, items });
  } catch (error) {
    return next(error);
  }
};

const createSellerBrand = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const profile = await ensureSellerProfile(user);
    await updatePlanStatusIfExpired(profile);

    const existingBrandsCount = await SellerBrand.countDocuments({ seller: user._id });

    if (hasReachedLimit(profile.currentPlan.brandLimit, existingBrandsCount)) {
      return res.status(403).json({
        success: false,
        message: "Please upgrade your subscription plan to add more products or brands.",
      });
    }

    const {
      brandName,
      logo,
      description,
      companyName,
      email,
      phone,
      address,
      city,
      state,
      country,
      pincode,
      gstNumber,
      websiteUrl,
    } = req.body;

    if (!brandName) {
      return res.status(400).json({ success: false, message: "Brand Name is required" });
    }

    const normalizedCompanyName = String(companyName || "").trim();
    const normalizedEmail = String(email || user.email).trim().toLowerCase();
    const normalizedPhone = String(phone || profile.phoneNumber || "").trim();
    const normalizedAddress = String(address || "").trim();
    const normalizedWebsiteUrl = String(websiteUrl || "").trim();

    const item = await SellerBrand.create({
      seller: user._id,
      sellerName: user.name,
      brandName: String(brandName).trim(),
      logo: String(logo || "").trim(),
      description: String(description || "").trim(),
      companyName: normalizedCompanyName,
      email: normalizedEmail,
      phone: normalizedPhone,
      address: normalizedAddress,
      city: String(city || "").trim(),
      state: String(state || "").trim(),
      country: String(country || "").trim(),
      pincode: String(pincode || "").trim(),
      gstNumber: String(gstNumber || "").trim(),
      websiteUrl: normalizedWebsiteUrl,
      contactInfo: {
        companyName: normalizedCompanyName,
        email: normalizedEmail,
        phone: normalizedPhone,
        websiteUrl: normalizedWebsiteUrl,
        address: normalizedAddress,
      },
      status: "pending",
    });

    await createSellerActivityNotification({
      seller: user,
      action: "add",
      itemType: "brand",
      itemId: item._id,
      itemName: item.brandName,
    });

    return res.status(201).json({ success: true, message: "Brand submitted for approval", item });
  } catch (error) {
    return next(error);
  }
};

const getMySellerBrands = async (req, res, next) => {
  try {
    const items = await SellerBrand.find({ seller: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, items });
  } catch (error) {
    return next(error);
  }
};

const getMySellerBrandById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await SellerBrand.findOne({ _id: id, seller: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    return res.status(200).json({ success: true, item });
  } catch (error) {
    return next(error);
  }
};

const updateMySellerBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await SellerBrand.findOne({ _id: id, seller: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    const {
      brandName,
      logo,
      description,
      companyName,
      email,
      phone,
      address,
      city,
      state,
      country,
      pincode,
      gstNumber,
      websiteUrl,
    } = req.body;

    if (brandName !== undefined) item.brandName = String(brandName).trim();
    if (logo !== undefined) item.logo = String(logo).trim();
    if (description !== undefined) item.description = String(description).trim();
    if (companyName !== undefined) item.companyName = String(companyName).trim();
    if (email !== undefined) item.email = String(email).trim().toLowerCase();
    if (phone !== undefined) item.phone = String(phone).trim();
    if (address !== undefined) item.address = String(address).trim();
    if (city !== undefined) item.city = String(city).trim();
    if (state !== undefined) item.state = String(state).trim();
    if (country !== undefined) item.country = String(country).trim();
    if (pincode !== undefined) item.pincode = String(pincode).trim();
    if (gstNumber !== undefined) item.gstNumber = String(gstNumber).trim();
    if (websiteUrl !== undefined) item.websiteUrl = String(websiteUrl).trim();

    item.contactInfo = {
      companyName: item.companyName,
      email: item.email,
      phone: item.phone,
      websiteUrl: item.websiteUrl,
      address: item.address,
    };

    item.status = "pending";
    item.reviewedBy = null;
    item.reviewedAt = null;

    await item.save();

    await createSellerActivityNotification({
      seller: { _id: req.user.id, name: item.sellerName },
      action: "edit",
      itemType: "brand",
      itemId: item._id,
      itemName: item.brandName,
    });

    return res.status(200).json({ success: true, message: "Brand updated and sent for review", item });
  } catch (error) {
    return next(error);
  }
};

const deleteMySellerBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await SellerBrand.findOne({ _id: id, seller: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    await item.deleteOne();

    await createSellerActivityNotification({
      seller: { _id: req.user.id, name: item.sellerName },
      action: "delete",
      itemType: "brand",
      itemId: item._id,
      itemName: item.brandName,
    });

    return res.status(200).json({ success: true, message: "Brand deleted" });
  } catch (error) {
    return next(error);
  }
};

const getAdminSellerBrands = async (_req, res, next) => {
  try {
    const items = await SellerBrand.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, items });
  } catch (error) {
    return next(error);
  }
};

const getAdminSellerBrandById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await SellerBrand.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    return res.status(200).json({ success: true, item });
  } catch (error) {
    return next(error);
  }
};

const createAdminSellerBrand = async (req, res, next) => {
  try {
    const { brandName, logo, description } = req.body || {};
    const normalizedBrandName = String(brandName || "").trim();

    if (!normalizedBrandName) {
      return res.status(400).json({ success: false, message: "Brand Name is required" });
    }

    const duplicate = await SellerBrand.findOne({
      brandName: { $regex: `^${normalizedBrandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });

    if (duplicate) {
      return res.status(409).json({ success: false, message: "Brand already exists" });
    }

    const user = await User.findById(req.user.id);
    const item = await SellerBrand.create({
      seller: req.user.id,
      sellerName: user?.name || "Admin",
      brandName: normalizedBrandName,
      logo: String(logo || "").trim(),
      description: String(description || "").trim(),
      status: "approved",
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    });

    return res.status(201).json({ success: true, message: "Brand created", item });
  } catch (error) {
    return next(error);
  }
};

const updateAdminSellerBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { brandName, logo, description } = req.body || {};
    const item = await SellerBrand.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    if (brandName !== undefined) {
      const normalizedBrandName = String(brandName || "").trim();

      if (!normalizedBrandName) {
        return res.status(400).json({ success: false, message: "Brand Name is required" });
      }

      const duplicate = await SellerBrand.findOne({
        _id: { $ne: id },
        brandName: { $regex: `^${normalizedBrandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      });

      if (duplicate) {
        return res.status(409).json({ success: false, message: "Brand already exists" });
      }

      item.brandName = normalizedBrandName;
    }

    if (logo !== undefined) item.logo = String(logo || "").trim();
    if (description !== undefined) item.description = String(description || "").trim();
    item.reviewedBy = req.user.id;
    item.reviewedAt = new Date();

    await item.save();

    return res.status(200).json({ success: true, message: "Brand updated", item });
  } catch (error) {
    return next(error);
  }
};

const updateAdminSellerBrandStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(String(status))) {
      return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
    }

    const item = await SellerBrand.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    item.status = String(status);
    item.reviewedBy = req.user.id;
    item.reviewedAt = new Date();
    await item.save();

    return res.status(200).json({ success: true, message: `Brand ${item.status}`, item });
  } catch (error) {
    return next(error);
  }
};

const deleteAdminSellerBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await SellerBrand.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    await item.deleteOne();
    return res.status(200).json({ success: true, message: "Brand deleted" });
  } catch (error) {
    return next(error);
  }
};

const createSellerProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const profile = await ensureSellerProfile(user);
    await updatePlanStatusIfExpired(profile);

    const existingProductsCount = await Product.countDocuments({ submittedBy: user._id, submittedByRole: "seller" });

    if (hasReachedLimit(profile.currentPlan.productLimit, existingProductsCount)) {
      return res.status(403).json({
        success: false,
        message: "Please upgrade your subscription plan to add more products or brands.",
      });
    }

    const { name, brandName, category, price, salePrice, rating, description, manufacturerName, manufacturerBrand, features, featureImage, gallery, specifications, metaTitle, metaDescription, metaKeywords, images } = req.body;

    if (!name || !category || price === undefined || price === null || Number.isNaN(Number(price))) {
      return res.status(400).json({ success: false, message: "Product Name, Category and Price are required" });
    }

    const categoryExists = await Category.exists({ _id: category });

    if (!categoryExists) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    const normalizedSpecifications = Array.isArray(specifications)
      ? specifications
          .filter(spec => spec && spec.title && spec.value)
          .map(spec => ({ title: String(spec.title).trim(), value: String(spec.value).trim() }))
      : [];

    const item = await Product.create({
      submittedBy: user._id,
      submittedByRole: "seller",
      sellerName: user.name,
      name: String(name).trim(),
      brandName: String(brandName || "").trim(),
      category,
      price: Number(price),
      salePrice: salePrice !== undefined && salePrice !== null && salePrice !== "" ? Number(salePrice) : null,
      rating: rating !== undefined && rating !== null && rating !== "" ? Number(rating) : 0,
      description: String(description || "").trim(),
      manufacturerName: String(manufacturerName || "").trim(),
      manufacturerBrand: String(manufacturerBrand || "").trim(),
      features: String(features || "").trim(),
      featureImage: String(featureImage || "").trim(),
      gallery: Array.isArray(gallery) ? gallery.map(entry => String(entry).trim()).filter(Boolean) : [],
      specifications: normalizedSpecifications,
      metaTitle: String(metaTitle || "").trim(),
      metaDescription: String(metaDescription || "").trim(),
      metaKeywords: String(metaKeywords || "").trim(),
      images: Array.isArray(images) ? images.map(entry => String(entry).trim()).filter(Boolean) : [],
      status: "pending",
    });

    await createSellerActivityNotification({
      seller: user,
      action: "add",
      itemType: "product",
      itemId: item._id,
      itemName: item.name,
    });

    return res.status(201).json({ success: true, message: "Product added", item });
  } catch (error) {
    return next(error);
  }
};

const getMySellerProducts = async (req, res, next) => {
  try {
    const items = await Product.find({ submittedBy: req.user.id, submittedByRole: "seller" })
      .populate("category", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, items });
  } catch (error) {
    return next(error);
  }
};

const updateSellerProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const product = await Product.findOne({ _id: req.params.id, submittedBy: user._id, submittedByRole: "seller" });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or access denied" });
    }

    const { name, brandName, category, price, salePrice, rating, description, manufacturerName, manufacturerBrand, features, featureImage, gallery, specifications, metaTitle, metaDescription, metaKeywords, images } = req.body;

    if (!name || !category || price === undefined || price === null || Number.isNaN(Number(price))) {
      return res.status(400).json({ success: false, message: "Product Name, Category and Price are required" });
    }

    const categoryExists = await Category.exists({ _id: category });
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    product.name = String(name).trim();
    product.brandName = String(brandName || "").trim();
    product.category = category;
    product.price = Number(price);
    product.salePrice = salePrice !== undefined && salePrice !== null && salePrice !== "" ? Number(salePrice) : null;
    product.rating = rating !== undefined && rating !== null && rating !== "" ? Number(rating) : product.rating;
    product.description = String(description || "").trim();
    product.manufacturerName = String(manufacturerName || "").trim();
    product.manufacturerBrand = String(manufacturerBrand || "").trim();
    product.features = String(features || "").trim();
    product.featureImage = String(featureImage || "").trim();
    if (Array.isArray(gallery)) product.gallery = gallery.map(g => String(g).trim()).filter(Boolean);
    if (Array.isArray(specifications)) {
      product.specifications = specifications
        .filter(spec => spec && spec.title && spec.value)
        .map(spec => ({ title: String(spec.title).trim(), value: String(spec.value).trim() }));
    }
    product.metaTitle = String(metaTitle || "").trim();
    product.metaDescription = String(metaDescription || "").trim();
    product.metaKeywords = String(metaKeywords || "").trim();
    if (Array.isArray(images)) product.images = images.map(i => String(i).trim()).filter(Boolean);
    // Reset to pending so admin re-approves the edited product
    product.status = "pending";

    await product.save();

    await createSellerActivityNotification({
      seller: user,
      action: "edit",
      itemType: "product",
      itemId: product._id,
      itemName: product.name,
    });

    return res.status(200).json({ success: true, message: "Product updated and sent for re-approval", item: product });
  } catch (error) {
    return next(error);
  }
};

const deleteSellerProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const product = await Product.findOneAndDelete({ _id: req.params.id, submittedBy: user._id, submittedByRole: "seller" });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or access denied" });
    }

    await createSellerActivityNotification({
      seller: user,
      action: "delete",
      itemType: "product",
      itemId: product._id,
      itemName: product.name,
    });

    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    return next(error);
  }
};

const getSellerPlanLimitStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const profile = await ensureSellerProfile(user);
    await updatePlanStatusIfExpired(profile);
    const [productsCount, brandsCount] = await Promise.all([
      Product.countDocuments({ submittedBy: user._id, submittedByRole: "seller" }),
      SellerBrand.countDocuments({ seller: user._id }),
    ]);

    return res.status(200).json({
      success: true,
      item: {
        planName: profile.currentPlan.planName,
        productLimit: profile.currentPlan.productLimit,
        brandLimit: profile.currentPlan.brandLimit,
        productsCount,
        brandsCount,
        reachedProductLimit: hasReachedLimit(profile.currentPlan.productLimit, productsCount),
        reachedBrandLimit: hasReachedLimit(profile.currentPlan.brandLimit, brandsCount),
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createSeller,
  getSellerApplications,
  applySeller,
  updateSellerApplicationStatus,
  getSellerDashboard,
  getSellerProfile,
  updateSellerProfile,
  getSellerCompanyInfo,
  updateSellerCompanyInfo,
  getSubscriptionPlans,
  createSubscriptionRequest,
  createSubscriptionCheckoutSession,
  handleSubscriptionWebhook,
  getMySubscriptionRequests,
  getAdminSubscriptionRequests,
  updateAdminSubscriptionRequestStatus,
  deleteAdminSubscriptionRequest,
  getSellerUsers,
  createSellerBrand,
  getMySellerBrands,
  getMySellerBrandById,
  updateMySellerBrand,
  deleteMySellerBrand,
  getAdminSellerBrands,
  getAdminSellerBrandById,
  createAdminSellerBrand,
  updateAdminSellerBrand,
  updateAdminSellerBrandStatus,
  deleteAdminSellerBrand,
  createSellerProduct,
  getMySellerProducts,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerPlanLimitStatus,
};




