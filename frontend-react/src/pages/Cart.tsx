import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { X, Minus, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  const [coupon, setCoupon] = useState("");
  const [shipping, setShipping] = useState("free");

  return (
    <Layout>
      <PageBanner title="Your Cart" breadcrumbs={[{ label: "Home", path: "/" }, { label: "Cart" }]} />

      <section className="py-10">
        <div className="container mx-auto">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add products from the catalog and they will appear here instantly.</p>
              <Link to="/shop" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Product</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Color</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Quantity</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-b border-border">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            <Link to={`/products/${item.slug}`} className="shrink-0">
                              <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover bg-secondary" />
                            </Link>
                            <Link to={`/products/${item.slug}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{item.name}</Link>
                          </div>
                        </td>
                        <td className="text-center px-4 py-4">
                          <div className="w-5 h-5 rounded-full bg-accent mx-auto" />
                        </td>
                        <td className="text-center px-4 py-4 text-sm font-medium text-foreground">${item.salePrice.toFixed(2)}</td>
                        <td className="text-center px-4 py-4">
                          <div className="inline-flex items-center border border-border rounded">
                            <button onClick={() => void updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground"><Minus className="w-3 h-3" /></button>
                            <span className="px-3 text-sm font-medium text-foreground">{item.quantity}</span>
                            <button onClick={() => void updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /></button>
                          </div>
                        </td>
                        <td className="text-center px-4 py-4 text-sm font-medium text-foreground">${(item.salePrice * item.quantity).toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <button onClick={() => void removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-2">
                  <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Discount Code" className="px-4 py-2.5 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm" />
                  <button className="px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-md hover:opacity-90 transition-opacity">Apply</button>
                </div>
                <div className="flex gap-3">
                  <Link to="/shop" className="px-5 py-2.5 border border-border rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors">Continue Shopping</Link>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full max-w-md bg-card border border-border rounded-lg p-6">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium text-foreground">Subtotal</span>
                    <span className="font-semibold text-price-sale">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <h4 className="font-medium text-foreground mb-3">Shipping</h4>
                    <div className="space-y-2">
                      {[
                        { value: "free", label: "Free Shipping", price: "+$00.00" },
                        { value: "flat", label: "Flat Rate", price: "+$00.00" },
                        { value: "local", label: "Local Delivery", price: "+$00.00" },
                      ].map(opt => (
                        <label key={opt.value} className="flex items-center justify-between text-sm cursor-pointer">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <input type="radio" name="shipping" value={opt.value} checked={shipping === opt.value} onChange={e => setShipping(e.target.value)} className="accent-primary" />
                            {opt.label}
                          </span>
                          <span className="text-muted-foreground">{opt.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <h4 className="font-medium text-foreground mb-3">Calculate Shipping</h4>
                    <div className="relative mb-3">
                      <select className="w-full px-4 py-2.5 border border-border rounded-md bg-background text-foreground text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary">
                        <option>Select Country</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <button className="text-sm text-primary font-medium hover:underline">Update Cart</button>
                  </div>

                  <div className="border-t border-border pt-4 flex justify-between items-center mb-4">
                    <span className="font-semibold text-foreground text-lg">Total</span>
                    <span className="font-bold text-foreground text-lg">${subtotal.toFixed(2)}</span>
                  </div>

                  <Link to="/checkout" className="block w-full py-3 bg-primary text-primary-foreground text-center font-semibold rounded-md hover:opacity-90 transition-opacity">
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
