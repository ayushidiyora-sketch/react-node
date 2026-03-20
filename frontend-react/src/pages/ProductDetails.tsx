import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Star, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { getProductBySlug, products, type Product } from "@/lib/products";
import { normalizeStoreProduct, productService } from "@/services/productService";

const imageFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='24'%3ENo Image%3C/text%3E%3C/svg%3E";

const ProductDetails = () => {
  const thumbnailWindowSize = 5;
  const { slug } = useParams();
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const items = await productService.list();

        if (isMounted) {
          setApiProducts(items.map(normalizeStoreProduct));
        }
      } catch {
        // Keep static fallback behavior when API is unavailable.
      } finally {
        if (isMounted) {
          setApiLoaded(true);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const staticProduct = slug ? getProductBySlug(slug) : undefined;
  const apiProduct = slug ? apiProducts.find(item => item.slug === slug) : undefined;
  const product = staticProduct ?? apiProduct;
  const productSource = staticProduct ? products : apiProducts;
  const relatedProducts = useMemo(
    () => (product ? productSource.filter(item => item.category === product.category && item.id !== product.id).slice(0, 4) : []),
    [product, productSource],
  );
  const galleryImages = useMemo(() => {
    const candidates = [
      ...(product?.galleryImages || []),
      product?.image,
    ].filter(Boolean) as string[];

    const uniqueImages = Array.from(new Set(candidates));

    return uniqueImages.length ? uniqueImages : [imageFallback];
  }, [product]);
  const [selectedImage, setSelectedImage] = useState(imageFallback);
  const [thumbnailStart, setThumbnailStart] = useState(0);
  const currentImageIndex = useMemo(() => {
    const index = galleryImages.findIndex(image => image === selectedImage);

    return index >= 0 ? index : 0;
  }, [galleryImages, selectedImage]);
  const visibleGalleryImages = useMemo(() => {
    if (galleryImages.length <= thumbnailWindowSize) {
      return galleryImages;
    }

    return galleryImages.slice(thumbnailStart, thumbnailStart + thumbnailWindowSize);
  }, [galleryImages, thumbnailStart]);
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const navigate = useNavigate();
  const sellerName = product?.sellerName || "Shopo Seller";
  const brandName = product?.brandName || "Unbranded";
  const sellerInitial = sellerName.charAt(0).toUpperCase();

  useEffect(() => {
    setSelectedImage(galleryImages[0]);
    setThumbnailStart(0);
  }, [galleryImages]);

  useEffect(() => {
    if (galleryImages.length <= thumbnailWindowSize) {
      return;
    }

    if (currentImageIndex < thumbnailStart) {
      setThumbnailStart(currentImageIndex);
      return;
    }

    if (currentImageIndex >= thumbnailStart + thumbnailWindowSize) {
      setThumbnailStart(currentImageIndex - thumbnailWindowSize + 1);
    }
  }, [currentImageIndex, galleryImages.length, thumbnailStart]);

  const goToPreviousImage = () => {
    if (!galleryImages.length) {
      return;
    }

    const previousIndex = currentImageIndex === 0 ? galleryImages.length - 1 : currentImageIndex - 1;
    setSelectedImage(galleryImages[previousIndex]);
  };

  const goToNextImage = () => {
    if (!galleryImages.length) {
      return;
    }

    const nextIndex = currentImageIndex === galleryImages.length - 1 ? 0 : currentImageIndex + 1;
    setSelectedImage(galleryImages[nextIndex]);
  };

  const goToPreviousThumbnails = () => {
    setThumbnailStart(previous => Math.max(previous - 1, 0));
  };

  const goToNextThumbnails = () => {
    const maxStart = Math.max(galleryImages.length - thumbnailWindowSize, 0);
    setThumbnailStart(previous => Math.min(previous + 1, maxStart));
  };

  if (!product && !apiLoaded) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto">
            <p className="text-sm text-muted-foreground">Loading product details...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <Layout>
      <PageBanner
        title={product.name}
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Shop", path: "/shop" },
          { label: product.name },
        ]}
      />

      <section className="py-10">
        <div className="container mx-auto">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="rounded-[2rem] border border-border bg-card p-4 shadow-sm">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-secondary">
                <img src={selectedImage} alt={product.name} className="h-full w-full object-cover" />

                {galleryImages.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={goToPreviousImage}
                      className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextImage}
                      className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {galleryImages.length > thumbnailWindowSize ? (
                  <button
                    type="button"
                    onClick={goToPreviousThumbnails}
                    disabled={thumbnailStart === 0}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous thumbnails"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                ) : null}

                <div className="grid flex-1 grid-cols-5 gap-3">
                  {visibleGalleryImages.map((image, index) => (
                    <button
                      key={`${image}-${thumbnailStart + index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`overflow-hidden rounded-md border transition-all ${selectedImage === image ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/60"}`}
                    >
                      <img src={image} alt={`${product.name} ${thumbnailStart + index + 1}`} className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>

                {galleryImages.length > thumbnailWindowSize ? (
                  <button
                    type="button"
                    onClick={goToNextThumbnails}
                    disabled={thumbnailStart >= Math.max(galleryImages.length - thumbnailWindowSize, 0)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next thumbnails"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">{product.category}</p>
              <h1 className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">{product.name}</h1>
              <div className="mb-4 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={`h-4 w-4 ${index < Math.floor(product.rating) ? "fill-current text-star" : "text-muted-foreground"}`} />
                ))}
                <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)} rating</span>
              </div>
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                {product.sellerProfileImage ? (
                  <img src={product.sellerProfileImage} alt={sellerName} className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">{sellerInitial}</span>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{sellerName}</p>
                  <p className="text-xs text-muted-foreground">Brand: {brandName}</p>
                </div>
              </div>
              <p className="mb-6 text-base leading-7 text-muted-foreground">{product.description}</p>

              <div className="mb-8 flex items-end gap-4">
                <span className="text-3xl font-bold text-price-sale">${product.salePrice.toFixed(2)}</span>
                <span className="pb-1 text-base text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              </div>

              <div className="mb-8 grid gap-3 rounded-2xl border border-border bg-card p-5">
                <h2 className="text-lg font-semibold text-foreground">Product Specifications</h2>
                {product.specifications.map(spec => (
                  <div key={spec.label} className="flex items-center justify-between gap-4 border-b border-border/70 pb-3 text-sm last:border-b-0 last:pb-0">
                    <span className="text-muted-foreground">{spec.label}</span>
                    <span className="font-medium text-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={async () => {
                    await addItem(product);
                    navigate("/cart");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="h-4 w-4" /> Add To Cart
                </button>
                <button
                  type="button"
                  onClick={() => void toggleItem(product)}
                  className={`inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 font-medium transition-colors ${isInWishlist(product.id) ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-secondary"}`}
                >
                  <Heart className="h-4 w-4" /> {isInWishlist(product.id) ? "Saved to Wishlist" : "Add to Wishlist"}
                </button>
              </div>

              <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Fast Delivery</p>
                    <p className="text-sm text-muted-foreground">Dispatch in 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Warranty Included</p>
                    <p className="text-sm text-muted-foreground">Covered for one year.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Easy Returns</p>
                    <p className="text-sm text-muted-foreground">30-day return window.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Keep Browsing</p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">Related Products</h2>
              </div>
              <Link to="/shop" className="text-sm font-medium text-primary hover:underline">View catalog</Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetails;