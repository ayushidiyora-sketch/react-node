import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/lib/products";

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const navigate = useNavigate();
  const sellerName = product.sellerName || "Shopo Seller";
  const brandName = product.brandName || "Unbranded";
  const sellerInitial = sellerName.charAt(0).toUpperCase();

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Link to={`/products/${product.slug}`} className="block h-full w-full">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </Link>
        {product.badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-primary-foreground rounded ${product.badge === "new" ? "bg-badge-new" : "bg-badge-popular"}`}>
            {product.badge}
          </span>
        )}
        {product.stock && !product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-foreground text-background rounded">
            {product.stock} left
          </span>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <button
            type="button"
            onClick={() => void toggleItem(product)}
            className={`w-8 h-8 bg-background rounded-full flex items-center justify-center shadow-md transition-colors ${isInWishlist(product.id) ? "text-primary" : "text-foreground hover:text-primary"}`}
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/products/${product.slug}`)}
            className="w-8 h-8 bg-background rounded-full flex items-center justify-center shadow-md text-foreground hover:text-primary transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <Link to={`/products/${product.slug}`} className="block">
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "text-star fill-current" : "text-muted-foreground"}`} />
            ))}
          </div>
          <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2 leading-snug hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.shortDescription}</p>
          <div className="border-border/70 flex gap-2 items-center mb-3 py-2 rounded-md">
            {product.sellerProfileImage ? (
              <img
                src={product.sellerProfileImage}
                alt={sellerName}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {sellerInitial}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">{sellerName}</p>
              <p className="truncate text-[11px] text-muted-foreground">Brand: {brandName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-price-sale font-bold">${product.salePrice.toFixed(2)}</span>
            <span className="text-muted-foreground line-through text-sm">${product.originalPrice.toFixed(2)}</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={async () => {
            await addItem(product);
            navigate("/cart");
          }}
          className="mt-3 w-full py-2 bg-primary text-primary-foreground rounded text-sm font-medium group-hover:opacity-100 transition-opacity duration-300 hover:opacity-90 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" /> Add To Cart
        </button>
      </div>
    </div>
  );
};

export const ProductSection = ({ title, products: items }: { title: string; products: Product[] }) => (
  <section className="py-12">
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold font-display text-foreground">{title}</h2>
        <Link to="/shop" className="text-sm text-primary font-medium hover:underline">View More</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {items.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  </section>
);
