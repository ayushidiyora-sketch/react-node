import { categoryService } from "./categoryService.ts";
import { notificationService } from "./notificationService.ts";
import { orderService } from "./orderService.ts";
import { productService } from "./productService.ts";
import { sellerPortalService } from "./sellerPortalService.ts";

type ResourceItem = {
  id: string;
  moduleKey: string;
  status: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderRecord = {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  items: OrderItem[];
  history: Array<{ status: string; at: string }>;
  createdAt: string;
  updatedAt: string;
};

type ModulePayload = {
  data: Record<string, unknown>;
  status: string;
};

type SubscriptionSummary = {
  _id: string;
  sellerName: string;
  planName: string;
  price?: number;
  paymentStatus: "Pending" | "Paid" | "Rejected";
  status: "pending" | "approved" | "rejected";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerEmail?: string;
  paymentGateway?: string;
  currency?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerHistoryItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  customerType: "Customer" | "Seller";
  transactionCount: number;
  totalAmount: number;
  lastPaymentDate: string;
  historySummary: string;
};

type MockStore = {
  resources: ResourceItem[];
  orders: OrderRecord[];
};

const storageKey = "admin-shopo-mock-store";

const now = () => new Date().toISOString();

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const sleep = async (milliseconds = 220) =>
  new Promise<void>(resolve => {
    window.setTimeout(resolve, milliseconds);
  });

const defaultStore = (): MockStore => {
  const createdAt = now();
  return {
    resources: [
      {
        id: createId(),
        moduleKey: "logos",
        status: "Active",
        data: { name: "Main Brand", imageUrl: "https://picsum.photos/240/80" },
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId(),
        moduleKey: "categories",
        status: "Active",
        data: { name: "Electronics", description: "Gadgets and accessories" },
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId(),
        moduleKey: "products",
        status: "Approved",
        data: { name: "Wireless Headphones", sku: "SKU-001", price: 99, stock: 25, category: "Electronics", images: ["https://picsum.photos/200"] },
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId(),
        moduleKey: "users",
        status: "Approved",
        data: { name: "Anita Sharma", email: "anita@demo.com", role: "Customer" },
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId(),
        moduleKey: "shipping",
        status: "Active",
        data: { name: "Standard Shipping", location: "India", rate: 5 },
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId(),
        moduleKey: "taxes",
        status: "Active",
        data: { name: "GST", percentage: 18, appliesTo: "All Products" },
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId(),
        moduleKey: "payments",
        status: "Successful",
        data: { transactionId: "TXN-1001", method: "Card", amount: 199 },
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId(),
        moduleKey: "notifications",
        status: "Active",
        data: { title: "Flash Sale Live", message: "Up to 40% off", target: "All Users" },
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId(),
        moduleKey: "services",
        status: "Active",
        data: { name: "Installation", description: "At-home setup", price: 29 },
        createdAt,
        updatedAt: createdAt,
      },
    ],
    orders: [
      {
        id: createId(),
        customerName: "Anita Sharma",
        customerEmail: "anita@demo.com",
        totalAmount: 229,
        paymentStatus: "Paid",
        orderStatus: "Processing",
        items: [
          { name: "Wireless Headphones", quantity: 1, price: 99 },
          { name: "Mechanical Keyboard", quantity: 1, price: 130 },
        ],
        history: [
          { status: "Pending", at: createdAt },
          { status: "Processing", at: createdAt },
        ],
        createdAt,
        updatedAt: createdAt,
      },
    ],
  };
};

const readStore = (): MockStore => {
  const raw = localStorage.getItem(storageKey);

  if (!raw) {
    const seed = defaultStore();
    localStorage.setItem(storageKey, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw) as MockStore;
  } catch {
    const seed = defaultStore();
    localStorage.setItem(storageKey, JSON.stringify(seed));
    return seed;
  }
};

const writeStore = (store: MockStore) => {
  localStorage.setItem(storageKey, JSON.stringify(store));
};

const ensureOrderSeed = (store: MockStore) => {
  if (store.orders.length >= 12) {
    return store;
  }

  const sampleNames = [
    "Neal Matthews",
    "Jamal Burnett",
    "Juan Mitchell",
    "Barry Dick",
    "Ronald Taylor",
    "Jacob Hunter",
    "William Cruz",
    "Dustin Moser",
    "Clark Benson",
    "Martha Holt",
    "George Yale",
    "Arianne Beck",
  ];

  const sampleStatuses = ["Paid", "Chargeback", "Paid", "Paid", "Refund", "Paid", "Paid", "Paid", "Refund", "Paid", "Paid", "Chargeback"];
  const sampleTotals = [400, 380, 384, 412, 404, 392, 374, 350, 345, 420, 390, 365];

  const nextOrders = [...store.orders];

  while (nextOrders.length < 12) {
    const index = nextOrders.length;
    const stamp = new Date(Date.now() - index * 86_400_000).toISOString();

    nextOrders.push({
      id: createId(),
      customerName: sampleNames[index],
      customerEmail: `${sampleNames[index].toLowerCase().replace(/\s+/g, ".")}@shopmail.com`,
      totalAmount: sampleTotals[index],
      paymentStatus: sampleStatuses[index],
      orderStatus: sampleStatuses[index] === "Refund" ? "Cancelled" : "Processing",
      items: [
        { name: "Wireless Headphones", quantity: 1, price: 99 },
        { name: "Mechanical Keyboard", quantity: 1, price: sampleTotals[index] - 99 },
      ],
      history: [
        { status: "Pending", at: stamp },
        { status: sampleStatuses[index] === "Refund" ? "Cancelled" : "Processing", at: stamp },
      ],
      createdAt: stamp,
      updatedAt: stamp,
    });
  }

  const updatedStore = { ...store, orders: nextOrders };
  writeStore(updatedStore);
  return updatedStore;
};

const mapModuleResources = (store: MockStore, moduleKey: string) => {
  if (moduleKey === "orders") {
    return store.orders.map(order => ({
      id: order.id,
      status: order.orderStatus,
      data: {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
      },
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  }

  return store.resources
    .filter(item => item.moduleKey === moduleKey)
    .map(item => ({
      id: item.id,
      status: item.status,
      data: item.data,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
};

const toIsoDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
};

const safeCurrency = (value: string | undefined) => (value || "INR").toUpperCase();

export const adminService = {
  getDashboard: async () => {
    await sleep(120);

    const [ordersResult, productsResult, categoriesResult, sellerUsersResult, notificationsResult] = await Promise.allSettled([
      orderService.list(),
      productService.list(),
      categoryService.list(),
      sellerPortalService.getSellerUsers(),
      notificationService.getNotifications({ limit: 5 }),
    ]);

    const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
    const products = productsResult.status === "fulfilled" ? productsResult.value : [];
    const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
    const sellerUsers = sellerUsersResult.status === "fulfilled" ? sellerUsersResult.value : [];
    const notifications = notificationsResult.status === "fulfilled"
      ? notificationsResult.value.map(item => ({
          id: item._id,
          title: item.message || item.itemName || "Notification",
          status: item.isRead ? "Read" : "Unread",
        }))
      : [];

    const customerEmails = new Set(
      orders
        .map(item => String(item.email || "").trim().toLowerCase())
        .filter(Boolean),
    );
    const sellerEmails = new Set(
      sellerUsers
        .map(item => String(item.email || "").trim().toLowerCase())
        .filter(Boolean),
    );
    const users = new Set([...customerEmails, ...sellerEmails]).size;

    return {
      totals: {
        users,
        orders: orders.length,
        products: products.length,
        categories: categories.length,
        revenue: orders.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0),
      },
      recentOrders: orders.slice(0, 6).map(item => ({
        id: item._id,
        orderId: item.orderId,
        customerName: item.customerName,
        status: item.orderStatus,
        totalAmount: Number(item.totalPrice || 0),
      })),
      notifications,
    };
  },
  listResources: async (moduleKey: string) => {
    await sleep();
    const store = ensureOrderSeed(readStore());
    return { items: mapModuleResources(store, moduleKey) };
  },
  createResource: async (moduleKey: string, payload: ModulePayload) => {
    await sleep();
    const store = ensureOrderSeed(readStore());
    const stamp = now();

    store.resources.unshift({
      id: createId(),
      moduleKey,
      status: payload.status,
      data: payload.data,
      createdAt: stamp,
      updatedAt: stamp,
    });

    writeStore(store);
    return { items: mapModuleResources(store, moduleKey) };
  },
  updateResource: async (moduleKey: string, id: string, payload: ModulePayload) => {
    await sleep();
    const store = ensureOrderSeed(readStore());

    const index = store.resources.findIndex(item => item.moduleKey === moduleKey && item.id === id);
    if (index === -1) {
      throw new Error("Resource not found");
    }

    store.resources[index] = {
      ...store.resources[index],
      data: payload.data,
      status: payload.status,
      updatedAt: now(),
    };

    writeStore(store);
    return { items: mapModuleResources(store, moduleKey) };
  },
  deleteResource: async (moduleKey: string, id: string) => {
    await sleep();
    const store = ensureOrderSeed(readStore());
    store.resources = store.resources.filter(item => !(item.moduleKey === moduleKey && item.id === id));
    writeStore(store);
    return { items: mapModuleResources(store, moduleKey) };
  },
  updateResourceStatus: async (moduleKey: string, id: string, status: string) => {
    await sleep();
    const store = ensureOrderSeed(readStore());

    if (moduleKey === "orders") {
      const order = store.orders.find(item => item.id === id);
      if (!order) throw new Error("Order not found");
      order.orderStatus = status;
      order.history.push({ status, at: now() });
      order.updatedAt = now();
      writeStore(store);
      return { items: mapModuleResources(store, moduleKey) };
    }

    const item = store.resources.find(resource => resource.moduleKey === moduleKey && resource.id === id);
    if (!item) throw new Error("Resource not found");

    item.status = status;
    item.updatedAt = now();
    writeStore(store);
    return { items: mapModuleResources(store, moduleKey) };
  },
  listOrders: async () => {
    await sleep();
    const store = ensureOrderSeed(readStore());
    return { items: store.orders };
  },
  getOrderById: async (orderId: string) => {
    await sleep();
    const store = ensureOrderSeed(readStore());
    const order = store.orders.find(item => item.id === orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    return { order };
  },
  updateOrderStatus: async (orderId: string, status: string) => {
    await sleep();
    const store = ensureOrderSeed(readStore());
    const order = store.orders.find(item => item.id === orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.orderStatus = status;
    order.history.push({ status, at: now() });
    order.updatedAt = now();
    writeStore(store);

    return { order };
  },
  listCustomerHistory: async () => {
    await sleep(120);

    const [ordersResult, subscriptionsResult] = await Promise.allSettled([
      orderService.list(),
      sellerPortalService.getAdminSubscriptions(),
    ]);

    const customerHistory: CustomerHistoryItem[] = [];

    if (ordersResult.status === "fulfilled") {
      const grouped = new Map<string, {
        name: string;
        email: string;
        transactionCount: number;
        totalAmount: number;
        lastPaymentDate: string;
      }>();

      for (const order of ordersResult.value) {
        const email = String(order.email || order.customerName || "customer").toLowerCase();
        const existing = grouped.get(email);
        const currentDate = toIsoDate(order.orderDate || order.createdAt || order.updatedAt);

        if (!existing) {
          grouped.set(email, {
            name: order.customerName,
            email: order.email || "-",
            transactionCount: 1,
            totalAmount: Number(order.totalPrice || 0),
            lastPaymentDate: currentDate,
          });
          continue;
        }

        existing.transactionCount += 1;
        existing.totalAmount += Number(order.totalPrice || 0);
        if (currentDate && (!existing.lastPaymentDate || currentDate > existing.lastPaymentDate)) {
          existing.lastPaymentDate = currentDate;
        }
      }

      for (const [key, entry] of grouped.entries()) {
        customerHistory.push({
          id: `customer-${key}`,
          name: entry.name,
          email: entry.email,
          phone: "-",
          customerType: "Customer",
          transactionCount: entry.transactionCount,
          totalAmount: entry.totalAmount,
          lastPaymentDate: entry.lastPaymentDate,
          historySummary: `${entry.transactionCount} order${entry.transactionCount > 1 ? "s" : ""}`,
        });
      }
    }

    if (subscriptionsResult.status === "fulfilled") {
      const grouped = new Map<string, {
        name: string;
        email: string;
        transactionCount: number;
        paidCount: number;
        totalAmount: number;
        lastPaymentDate: string;
      }>();

      for (const subscription of subscriptionsResult.value as SubscriptionSummary[]) {
        const email = String(subscription.stripeCustomerEmail || `${subscription.sellerName}@seller.local`).toLowerCase();
        const existing = grouped.get(email);
        const amount = Number(subscription.price || 0);
        const eventDate = toIsoDate(subscription.paidAt || subscription.updatedAt || subscription.createdAt);
        const isPaid = subscription.paymentStatus === "Paid";

        if (!existing) {
          grouped.set(email, {
            name: subscription.sellerName,
            email,
            transactionCount: 1,
            paidCount: isPaid ? 1 : 0,
            totalAmount: isPaid ? amount : 0,
            lastPaymentDate: isPaid ? eventDate : "",
          });
          continue;
        }

        existing.transactionCount += 1;
        if (isPaid) {
          existing.paidCount += 1;
          existing.totalAmount += amount;
          if (eventDate && (!existing.lastPaymentDate || eventDate > existing.lastPaymentDate)) {
            existing.lastPaymentDate = eventDate;
          }
        }
      }

      for (const [key, entry] of grouped.entries()) {
        customerHistory.push({
          id: `seller-${key}`,
          name: entry.name,
          email: entry.email,
          phone: "-",
          customerType: "Seller",
          transactionCount: entry.transactionCount,
          totalAmount: entry.totalAmount,
          lastPaymentDate: entry.lastPaymentDate,
          historySummary: `${entry.paidCount}/${entry.transactionCount} paid subscriptions`,
        });
      }
    }

    customerHistory.sort((left, right) => {
      const leftDate = left.lastPaymentDate || "";
      const rightDate = right.lastPaymentDate || "";
      return rightDate.localeCompare(leftDate);
    });

    return { items: customerHistory };
  },
  listPaymentTransactions: async () => {
    await sleep(120);

    const [ordersResult, subscriptionsResult] = await Promise.allSettled([
      orderService.list(),
      sellerPortalService.getAdminSubscriptions(),
    ]);

    const items: Array<{
      id: string;
      status: string;
      data: Record<string, unknown>;
      createdAt: string;
      updatedAt: string;
    }> = [];

    if (ordersResult.status === "fulfilled") {
      for (const order of ordersResult.value) {
        const method = String(order.paymentMethod || "Unknown");
        const normalizedMethod = method.toLowerCase();
        const isCardPayment = normalizedMethod.includes("card") || normalizedMethod.includes("credit") || normalizedMethod.includes("debit");

        items.push({
          id: `order-${order._id}`,
          status: isCardPayment ? "Successful" : "Pending",
          data: {
            transactionId: `ORD-${String(order._id).slice(0, 8).toUpperCase()}`,
            source: "Order",
            customerEmail: order.email || "-",
            method,
            gateway: isCardPayment ? "Card Processor" : "Offline",
            amount: Number(order.totalPrice || 0),
            paidAt: toIsoDate(order.orderDate || order.createdAt || order.updatedAt),
          },
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        });
      }
    }

    if (subscriptionsResult.status === "fulfilled") {
      for (const subscription of subscriptionsResult.value as SubscriptionSummary[]) {
        const status = subscription.paymentStatus === "Paid"
          ? "Successful"
          : subscription.paymentStatus === "Rejected"
            ? "Failed"
            : "Pending";

        const paidAt = toIsoDate(subscription.paidAt || subscription.updatedAt || subscription.createdAt);

        items.push({
          id: `subscription-${subscription._id}`,
          status,
          data: {
            transactionId: subscription.stripePaymentIntentId || subscription.stripeCheckoutSessionId || subscription._id,
            source: "Seller Subscription",
            customerEmail: subscription.stripeCustomerEmail || "-",
            method: "Card",
            gateway: subscription.paymentGateway || "stripe",
            amount: Number(subscription.price || 0),
            currency: safeCurrency(subscription.currency),
            planName: subscription.planName,
            paidAt,
          },
          createdAt: subscription.createdAt || paidAt,
          updatedAt: subscription.updatedAt || paidAt,
        });
      }
    }

    items.sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")));
    return { items };
  },
};