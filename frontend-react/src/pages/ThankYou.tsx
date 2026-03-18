import { jsPDF } from "jspdf";
import { CheckCircle2, Download, ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { getLastOrder } from "@/lib/order";

const ThankYou = () => {
  const { orderId } = useParams();
  const order = useMemo(() => getLastOrder(), []);

  if (!order || (orderId && order.id !== orderId)) {
    return <Navigate to="/shop" replace />;
  }

  const downloadInvoice = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("ShopO Invoice", 14, 18);

    doc.setFontSize(11);
    doc.text(`Order ID: ${order.id}`, 14, 28);
    doc.text(`Placed At: ${new Date(order.placedAt).toLocaleString()}`, 14, 34);
    doc.text(`Customer: ${order.customer.firstName} ${order.customer.lastName}`, 14, 40);
    doc.text(`Email: ${order.customer.email}`, 14, 46);
    doc.text(`Phone: ${order.customer.phone || "N/A"}`, 14, 52);
    doc.text(`Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.state}, ${order.customer.zipCode}, ${order.customer.country}`, 14, 58, { maxWidth: 180 });

    let y = 74;
    doc.setFontSize(12);
    doc.text("Items", 14, y);
    y += 8;

    doc.setFontSize(10);
    order.items.forEach(item => {
      doc.text(`${item.name} x${item.quantity}`, 14, y);
      doc.text(`$${item.total.toFixed(2)}`, 178, y, { align: "right" });
      y += 7;
    });

    y += 4;
    doc.line(14, y, 180, y);
    y += 8;

    doc.text(`Subtotal: $${order.totals.subtotal.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Shipping: $${order.totals.shipping.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Tax: $${order.totals.tax.toFixed(2)}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Grand Total: $${order.totals.grandTotal.toFixed(2)}`, 14, y);

    doc.save(`invoice-${order.id}.pdf`);
  };

  return (
    <Layout>
      <PageBanner title="Order Confirmed" breadcrumbs={[{ label: "Home", path: "/" }, { label: "Thank You" }]} />

      <section className="py-10">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3 text-primary">
              <CheckCircle2 className="h-8 w-8" />
              <h2 className="text-2xl font-bold text-foreground">Thank you for your order!</h2>
            </div>

            <p className="mb-6 text-muted-foreground">
              Your order has been placed successfully. A confirmation summary is below.
            </p>

            <div className="mb-6 grid gap-4 rounded-lg border border-border bg-background p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Order ID</p>
                <p className="font-semibold text-foreground">{order.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Placed On</p>
                <p className="font-semibold text-foreground">{new Date(order.placedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-6 space-y-3 border-b border-border pb-6">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.name} x{item.quantity}</span>
                  <span className="font-medium text-foreground">${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mb-8 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${order.totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">${order.totals.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">${order.totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span className="text-foreground">Grand Total</span>
                <span className="text-foreground">${order.totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={downloadInvoice}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <ShoppingBag className="h-4 w-4" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ThankYou;