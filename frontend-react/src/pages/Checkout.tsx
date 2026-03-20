import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { useCart } from "@/contexts/CartContext";
import { PayPalButton } from "@/components/PayPalButton";
import { toast } from "@/components/ui/sonner";
import { saveLastOrder } from "@/lib/order";
import { checkoutService } from "@/services/checkoutService";
import { paymentService } from "@/services/paymentService";
import { orderService } from "@/services/orderService";


const stripePaymentMethod = "Credit / Debit Card";

const buildFallbackChargeSummary = (subtotal: number, country?: string) => {
  const shippingAmount = subtotal > 120 ? 0 : 9.99;
  const taxRate = 8;
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const total = Number((subtotal + shippingAmount + taxAmount).toFixed(2));

  return {
    currency: "USD",
    country: country || "United States",
    subtotal: Number(subtotal.toFixed(2)),
    shippingAmount,
    taxRate,
    taxAmount,
    total,
  };
};

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#111827",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#dc2626",
    },
  },
};

type CheckoutContentProps = {
  stripeInitializing: boolean;
  stripeReady: boolean;
};

const CheckoutContent = ({ stripeInitializing, stripeReady }: CheckoutContentProps) => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [paymentMethod, setPaymentMethod] = useState(stripePaymentMethod);
  const [cardError, setCardError] = useState("");
  const [chargeSummary, setChargeSummary] = useState(() => buildFallbackChargeSummary(subtotal, "United States"));
  const [paypalError, setPaypalError] = useState("");
  const [isChargesLoading, setIsChargesLoading] = useState(false);

  const shippingFee = chargeSummary.shippingAmount;
  const tax = chargeSummary.taxAmount;
  const grandTotal = chargeSummary.total;
  const isStripeMethod = paymentMethod === stripePaymentMethod;
  const isPayPalMethod = paymentMethod === "PayPal";
  const stripeCountryCode = useMemo(() => {
    if (country === "United States") {
      return "US";
    }

    if (country === "United Kingdom") {
      return "GB";
    }

    if (country === "Canada") {
      return "CA";
    }

    return undefined;
  }, [country]);
const currencyFormatter = useMemo(
  () =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }),
  [],
);

  useEffect(() => {
    if (items.length === 0) {
      setChargeSummary(buildFallbackChargeSummary(0, country));
      return;
    }

    let isActive = true;

    const loadCharges = async () => {
      setIsChargesLoading(true);

      try {
        const response = await checkoutService.calculateCharges({
          subtotal,
          country,
        });

        if (isActive) {
          setChargeSummary(response);
        }
      } catch {
        if (isActive) {
          setChargeSummary(buildFallbackChargeSummary(subtotal, country));
        }
      } finally {
        if (isActive) {
          setIsChargesLoading(false);
        }
      }
    };

    void loadCharges();

    return () => {
      isActive = false;
    };
  }, [items.length, subtotal, country]);

  useEffect(() => {
    setCardError("");
    setPaypalError("");
  }, [paymentMethod]);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      return;
    }

    if (!firstName || !lastName || !email || !address || !city || !stateName || !zipCode) {
      toast.error("Please fill all required checkout fields.");
      return;
    }

    if (isPayPalMethod) {
      toast.info("Click the PayPal button below to complete payment.");
      return;
    }

    if (isStripeMethod && !stripeReady) {
      toast.error("Stripe payment is not configured right now. Please choose another payment method.");
      return;
    }

    setIsPlacingOrder(true);
    setCardError("");

    try {
      const orderId = `ORD-${Date.now().toString().slice(-8)}`;

      if (isStripeMethod) {
        if (!stripe || !elements) {
          throw new Error("Stripe is still loading. Please try again.");
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
          throw new Error("Card input is not ready yet.");
        }

        const paymentIntent = await paymentService.createPaymentIntent({
          amount: grandTotal,
          currency: (chargeSummary.currency || "USD").toLowerCase(),
          orderId,
          customerEmail: email,
          metadata: {
            subtotal: chargeSummary.subtotal.toFixed(2),
            shippingAmount: chargeSummary.shippingAmount.toFixed(2),
            taxAmount: chargeSummary.taxAmount.toFixed(2),
            taxRate: chargeSummary.taxRate.toFixed(2),
            country: chargeSummary.country,
          },
        });

        const confirmedPayment = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${firstName} ${lastName}`.trim(),
              email,
              phone,
              address: {
                line1: address,
                city,
                state: stateName,
                postal_code: zipCode,
                country: stripeCountryCode,
              },
            },
          },
        });

        if (confirmedPayment.error) {
          throw new Error(confirmedPayment.error.message || "Card payment failed");
        }

        if (confirmedPayment.paymentIntent?.status !== "succeeded") {
          throw new Error("Payment was not completed.");
        }
      }

      saveLastOrder({
        id: orderId,
        placedAt: new Date().toISOString(),
        customer: {
          firstName,
          lastName,
          email,
          phone,
          address,
          city,
          state: stateName,
          zipCode,
          country,
        },
        paymentMethod,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.salePrice,
          total: item.salePrice * item.quantity,
        })),
        totals: {
          subtotal: chargeSummary.subtotal,
          shipping: shippingFee,
          tax,
          grandTotal,
        },
      });

      const fullAddress = `${address}, ${city}, ${stateName}, ${zipCode}, ${country}`;

      await orderService.create({
        orderId,
        customerName: `${firstName} ${lastName}`.trim(),
        email,
        address: fullAddress,
        products: items.map(item => ({
          productId: String(item.id),
          name: item.name,
          image: item.image,
          price: item.salePrice,
          quantity: item.quantity,
        })),
        subtotal: chargeSummary.subtotal,
        shippingAmount: chargeSummary.shippingAmount,
        taxAmount: chargeSummary.taxAmount,
        taxRate: chargeSummary.taxRate,
        currency: chargeSummary.currency,
        country: chargeSummary.country,
        totalPrice: grandTotal,
        paymentMethod,
        orderDate: new Date().toISOString(),
      });

      await clearCart();
      toast.success("Order placed successfully.");
      navigate(`/thank-you/${orderId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not place order. Please try again.";
      setCardError(message);
      toast.error(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePayPalSuccess = async () => {
    if (items.length === 0) {
      return;
    }

    if (!firstName || !lastName || !email || !address || !city || !stateName || !zipCode) {
      toast.error("Please fill all required checkout fields.");
      return;
    }

    setIsPlacingOrder(true);
    setPaypalError("");

    try {
      const orderId = `ORD-${Date.now().toString().slice(-8)}`;

      saveLastOrder({
        id: orderId,
        placedAt: new Date().toISOString(),
        customer: {
          firstName,
          lastName,
          email,
          phone,
          address,
          city,
          state: stateName,
          zipCode,
          country,
        },
        paymentMethod: "PayPal",
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.salePrice,
          total: item.salePrice * item.quantity,
        })),
        totals: {
          subtotal: chargeSummary.subtotal,
          shipping: shippingFee,
          tax,
          grandTotal,
        },
      });

      const fullAddress = `${address}, ${city}, ${stateName}, ${zipCode}, ${country}`;

      await orderService.create({
        orderId,
        customerName: `${firstName} ${lastName}`.trim(),
        email,
        address: fullAddress,
        products: items.map(item => ({
          productId: String(item.id),
          name: item.name,
          image: item.image,
          price: item.salePrice,
          quantity: item.quantity,
        })),
        subtotal: chargeSummary.subtotal,
        shippingAmount: chargeSummary.shippingAmount,
        taxAmount: chargeSummary.taxAmount,
        taxRate: chargeSummary.taxRate,
        currency: chargeSummary.currency,
        country: chargeSummary.country,
        totalPrice: grandTotal,
        paymentMethod: "PayPal",
        orderDate: new Date().toISOString(),
      });

      await clearCart();
      toast.success("Order placed successfully.");
      navigate(`/thank-you/${orderId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create order. Please try again.";
      setPaypalError(message);
      toast.error(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <Layout>
      <PageBanner title="Checkout" breadcrumbs={[{ label: "Home", path: "/" }, { label: "Checkout" }]} />

      <section className="py-10">
        <div className="container mx-auto">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
              <h2 className="mb-3 text-2xl font-semibold text-foreground">Your cart is empty</h2>
              <p className="mb-6 text-muted-foreground">Add products before proceeding to checkout.</p>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Go To Shop
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="mb-4 text-xl font-semibold text-foreground">Contact Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} className="rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="First Name" />
                    <input value={lastName} onChange={e => setLastName(e.target.value)} className="rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Last Name" />
                    <input value={email} onChange={e => setEmail(e.target.value)} className="rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:col-span-2" placeholder="Email Address" type="email" />
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:col-span-2" placeholder="Phone Number" type="tel" />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="mb-4 text-xl font-semibold text-foreground">Shipping Address</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input value={address} onChange={e => setAddress(e.target.value)} className="rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:col-span-2" placeholder="Street Address" />
                    <input value={city} onChange={e => setCity(e.target.value)} className="rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="City" />
                    <input value={stateName} onChange={e => setStateName(e.target.value)} className="rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="State" />
                    <input value={zipCode} onChange={e => setZipCode(e.target.value)} className="rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="ZIP Code" />
                    <select value={country} onChange={e => setCountry(e.target.value)} className="rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="mb-4 text-xl font-semibold text-foreground">Payment Method</h2>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === stripePaymentMethod}
                        onChange={() => setPaymentMethod(stripePaymentMethod)}
                        className="accent-primary"
                      />
                      Credit / Debit Card (Stripe)
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="payment" checked={paymentMethod === "PayPal"} onChange={() => setPaymentMethod("PayPal")} className="accent-primary" />
                      PayPal
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="payment" checked={paymentMethod === "Cash On Delivery"} onChange={() => setPaymentMethod("Cash On Delivery")} className="accent-primary" />
                      Cash On Delivery
                    </label>

                    {isStripeMethod ? (
                      <div className="mt-3 rounded-md border border-border bg-background p-3">
                        {stripeReady ? (
                          <CardElement options={cardElementOptions} />
                        ) : (
                          <p className="text-sm text-muted-foreground">Loading card input...</p>
                        )}
                      </div>
                    ) : null}

                    {cardError ? (
                      <p className="text-sm text-red-600">{cardError}</p>
                    ) : null}

                    {isPayPalMethod ? (
                      <PayPalButton
                        amount={grandTotal}
                        orderId={`ORD-${Date.now().toString().slice(-8)}`}
                        customerEmail={email}
                        onSuccess={() => {
                          void handlePayPalSuccess();
                        }}
                        onError={setPaypalError}
                        isLoading={isPlacingOrder}
                      />
                    ) : null}

                    {paypalError ? (
                      <p className="text-sm text-red-600">{paypalError}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <aside className="rounded-lg border border-border bg-card p-6 h-fit">
                <h2 className="mb-4 text-xl font-semibold text-foreground">Order Summary</h2>

                <div className="space-y-4 border-b border-border pb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="h-14 w-14 rounded object-cover bg-secondary" />
                      <div className="flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">{currencyFormatter.format(item.salePrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{currencyFormatter.format(chargeSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-foreground">{currencyFormatter.format(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium text-foreground">{currencyFormatter.format(tax)} ({chargeSummary.taxRate.toFixed(2)}%)</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">{currencyFormatter.format(grandTotal)}</span>
                </div>

                {isChargesLoading ? <p className="mt-2 text-xs text-muted-foreground">Refreshing shipping & tax rates...</p> : null}

                <button
                  type="button"
                  onClick={() => void handlePlaceOrder()}
                  disabled={isPlacingOrder}
                  className="mt-6 w-full rounded-md bg-primary py-3 text-center font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPlacingOrder ? "Processing..." : "Place Order"}
                </button>
              </aside>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

const Checkout = () => {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeInitializing, setStripeInitializing] = useState(true);

  useEffect(() => {
    let isActive = true;

    const initStripe = async () => {
      const envKey = String(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "").trim();

      if (envKey) {
        if (isActive) {
          setStripePromise(loadStripe(envKey));
          setStripeReady(true);
        }
        return;
      }

      try {
        const config = await paymentService.getPaymentConfig();
        const runtimeKey = String(config.stripePublishableKey || "").trim();

        if (runtimeKey && isActive) {
          setStripePromise(loadStripe(runtimeKey));
          setStripeReady(true);
          return;
        }
      } catch {
        // Keep checkout usable with non-card payment methods.
      }

      if (isActive) {
        setStripePromise(null);
        setStripeReady(false);
      }

      if (isActive) {
        setStripeInitializing(false);
      }
    };

    void initStripe();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <Elements stripe={stripePromise ?? null}>
      <CheckoutContent stripeInitializing={stripeInitializing} stripeReady={stripeReady} />
    </Elements>
  );
};

export default Checkout;