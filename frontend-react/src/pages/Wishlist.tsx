import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

const Wishlist = () => {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const navigate = useNavigate();

  return (
    <Layout>
      <PageBanner title="Your Wishlist" breadcrumbs={[{ label: "Home", path: "/" }, { label: "Wishlist" }]} />

      <section className="py-10">
        <div className="container mx-auto">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
              <Heart className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="mb-3 text-2xl font-semibold text-foreground">Your wishlist is empty</h2>
              <p className="mb-6 text-muted-foreground">Save products you want to revisit and compare later.</p>
              <Link to="/shop" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map(item => (
                <article key={item.id} className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:grid-cols-[120px_1fr_auto] md:items-center">
                  <Link to={`/products/${item.slug}`} className="overflow-hidden rounded-xl bg-secondary">
                    <img src={item.image} alt={item.name} className="h-28 w-full object-cover" />
                  </Link>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.category}</p>
                    <Link to={`/products/${item.slug}`} className="block text-lg font-semibold text-foreground hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.shortDescription}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-lg font-bold text-price-sale">${item.salePrice.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground line-through">${item.originalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 md:items-end">
                    <button
                      type="button"
                      onClick={async () => {
                        await addItem(item);
                        navigate("/cart");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add To Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeItem(item.id)}
                      className="inline-flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Wishlist;