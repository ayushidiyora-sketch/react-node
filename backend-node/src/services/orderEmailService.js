const nodemailer = require("nodemailer");

let transporter = null;

const isEmailConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  );
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const smtpPort = Number(process.env.SMTP_PORT);
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.isFinite(smtpPort) ? smtpPort : 587,
    secure: smtpSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatMoney = (value, currency = "USD") => {
  const amount = Number(value);
  const normalized = Number.isFinite(amount) ? amount : 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currency || "USD").toUpperCase(),
    }).format(normalized);
  } catch {
    return `${normalized.toFixed(2)} ${String(currency || "USD").toUpperCase()}`;
  }
};

const formatOrderDate = (value) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildOrderConfirmationHtml = ({
  orderId,
  customerName,
  products,
  subtotal,
  shippingAmount,
  taxAmount,
  taxRate,
  totalPrice,
  currency,
  paymentMethod,
  address,
  orderDate,
}) => {
  const itemsRows = products
    .map((item, index) => {
      const lineTotal = Number(item.price) * Number(item.quantity);

      return `
        <tr>
          <td style="padding:12px 10px;border-bottom:1px solid #eceff3;color:#111827;font-size:14px;">${index + 1}</td>
          <td style="padding:12px 10px;border-bottom:1px solid #eceff3;color:#111827;font-size:14px;">${escapeHtml(item.name)}</td>
          <td style="padding:12px 10px;border-bottom:1px solid #eceff3;color:#111827;font-size:14px;text-align:center;">${Number(item.quantity)}</td>
          <td style="padding:12px 10px;border-bottom:1px solid #eceff3;color:#111827;font-size:14px;text-align:right;">${formatMoney(item.price, currency)}</td>
          <td style="padding:12px 10px;border-bottom:1px solid #eceff3;color:#111827;font-size:14px;text-align:right;">${formatMoney(lineTotal, currency)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;color:#111827;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#1d4ed8;padding:24px;">
          <h1 style="margin:0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">Your order has been placed successfully</h1>
          <p style="margin:8px 0 0;color:#dbeafe;font-size:14px;">Thank you for shopping with us. Your order details are below.</p>
        </div>

        <div style="padding:24px;">
          <p style="margin:0 0 8px;font-size:15px;color:#111827;">Hi <strong>${escapeHtml(customerName)}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#4b5563;">Thank you for your order. We have received your purchase and will notify you once it is processed.</p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
            <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
              <p style="margin:0 0 6px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.03em;">Order ID</p>
              <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(orderId)}</p>
            </div>
            <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
              <p style="margin:0 0 6px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.03em;">Order Date</p>
              <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(formatOrderDate(orderDate))}</p>
            </div>
            <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
              <p style="margin:0 0 6px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.03em;">Payment Method</p>
              <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(paymentMethod)}</p>
            </div>
            <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
              <p style="margin:0 0 6px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.03em;">Shipping Address</p>
              <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(address)}</p>
            </div>
          </div>

          <h2 style="margin:0 0 10px;font-size:16px;color:#111827;">Product Details</h2>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border:1px solid #eceff3;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:12px 10px;text-align:left;font-size:12px;color:#334155;text-transform:uppercase;">#</th>
                <th style="padding:12px 10px;text-align:left;font-size:12px;color:#334155;text-transform:uppercase;">Product</th>
                <th style="padding:12px 10px;text-align:center;font-size:12px;color:#334155;text-transform:uppercase;">Qty</th>
                <th style="padding:12px 10px;text-align:right;font-size:12px;color:#334155;text-transform:uppercase;">Price</th>
                <th style="padding:12px 10px;text-align:right;font-size:12px;color:#334155;text-transform:uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div style="margin-top:20px;border-top:1px solid #eceff3;padding-top:12px;">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:#374151;"><span>Subtotal</span><strong>${formatMoney(subtotal, currency)}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:#374151;"><span>Shipping</span><strong>${formatMoney(shippingAmount, currency)}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:#374151;"><span>Tax (${Number(taxRate).toFixed(2)}%)</span><strong>${formatMoney(taxAmount, currency)}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:8px 0 0;font-size:16px;color:#111827;border-top:1px solid #eceff3;margin-top:8px;"><span><strong>Total Amount</strong></span><strong>${formatMoney(totalPrice, currency)}</strong></div>
          </div>

          <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">If you have any questions, simply reply to this email. Thank you again for your purchase.</p>
        </div>
      </div>
    </div>
  `;
};

const sendOrderConfirmationEmail = async ({
  to,
  orderId,
  customerName,
  products,
  subtotal,
  shippingAmount,
  taxAmount,
  taxRate,
  totalPrice,
  currency,
  paymentMethod,
  address,
  orderDate,
}) => {
  if (!isEmailConfigured()) {
    return {
      sent: false,
      reason: "Email service is not configured",
    };
  }

  const mailTransporter = getTransporter();

  const html = buildOrderConfirmationHtml({
    orderId,
    customerName,
    products,
    subtotal,
    shippingAmount,
    taxAmount,
    taxRate,
    totalPrice,
    currency,
    paymentMethod,
    address,
    orderDate,
  });

  await mailTransporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Order Confirmation - ${orderId}`,
    html,
  });

  return {
    sent: true,
  };
};

module.exports = {
  sendOrderConfirmationEmail,
};
