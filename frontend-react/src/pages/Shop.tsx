import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { ProductCard } from "@/components/ProductCard";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import type { Product } from "@/lib/products";
import { categoryService } from "@/services/categoryService";
import { normalizeStoreProduct, productService } from "@/services/productService";
import { sellerService } from "@/services/sellerService";

const sizes = ["S", "M", "XL", "XXL", "Slim Fit"];
const productsPerPage = 3;

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border pb-4 mb-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left font-semibold text-foreground mb-3">
        {title}
        {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>
      {open && children}
    </div>
  );
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [apiBrands, setApiBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadShopData = async () => {
      try {
        const [productItems, categoryItems] = await Promise.all([productService.list(), categoryService.list()]);
        const mappedProducts = productItems.map(normalizeStoreProduct);

        setProducts(mappedProducts);

        const categoryNames = categoryItems.map(item => item.name);
        const fallbackCategories = Array.from(new Set(mappedProducts.map(item => item.category)));
        setCategories(categoryNames.length ? categoryNames : fallbackCategories);

        try {
          const brandItems = await sellerService.getPublicBrandLogos();
          const normalizedApiBrands = Array.from(
            new Set(
              brandItems
                .map(item => String(item.brandName || "").trim())
                .filter(Boolean),
            ),
          );
          setApiBrands(normalizedApiBrands);
        } catch {
          setApiBrands([]);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load products";
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadShopData();
  }, []);

  useEffect(() => {
    const selectedFromQuery = searchParams
      .getAll("category")
      .map(item => item.trim())
      .filter(Boolean);

    setSelectedCategories(selectedFromQuery);
  }, [searchParams]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(previous =>
      previous.includes(categoryName)
        ? previous.filter(item => item !== categoryName)
        : [...previous, categoryName],
    );
  };

  const toggleBrand = (brandName: string) => {
    setSelectedBrands(previous =>
      previous.includes(brandName)
        ? previous.filter(item => item !== brandName)
        : [...previous, brandName],
    );
  };

  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>();

    products.forEach(item => {
      const normalizedBrand = String(item.brandName || "").trim() || "Others";
      counts.set(normalizedBrand, (counts.get(normalizedBrand) || 0) + 1);
    });

    return counts;
  }, [products]);

  const brands = useMemo(() => {
    const productBrands = Array.from(brandCounts.keys());
    const merged = [...apiBrands];

    productBrands.forEach(brand => {
      if (!merged.includes(brand)) {
        merged.push(brand);
      }
    });

    return merged;
  }, [apiBrands, brandCounts]);

  const allProducts = useMemo(() => {
    const filteredProducts = products.filter(item => {
      const categoryMatched = !selectedCategories.length || selectedCategories.includes(item.category);
      const normalizedBrand = String(item.brandName || "").trim() || "Others";
      const brandMatched = !selectedBrands.length || selectedBrands.includes(normalizedBrand);

      return categoryMatched && brandMatched;
    });

    return filteredProducts.sort((left, right) => {
    if (sortBy === "price-low") {
      return left.salePrice - right.salePrice;
    }

    if (sortBy === "price-high") {
      return right.salePrice - left.salePrice;
    }

    if (sortBy === "rating") {
      return right.rating - left.rating;
    }

    return left.id - right.id;
    });
  }, [products, selectedCategories, selectedBrands, sortBy]);

  const totalPages = Math.max(1, Math.ceil(allProducts.length / productsPerPage));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return allProducts.slice(startIndex, startIndex + productsPerPage);
  }, [allProducts, currentPage]);

  const rangeStart = allProducts.length === 0 ? 0 : (currentPage - 1) * productsPerPage + 1;
  const rangeEnd = allProducts.length === 0 ? 0 : Math.min(currentPage * productsPerPage, allProducts.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, selectedCategories, selectedBrands]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <Layout showNewsletter={false}>
      <PageBanner title="All Products" breadcrumbs={[{ label: "Home", path: "/" }, { label: "Shop" }]} />

      <section className="py-10">
        <div className="container mx-auto flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <FilterSection title="Product categories">
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="rounded border-border accent-primary"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Price Range">
              <input type="range" min={0} max={1000} defaultValue={500} className="w-full accent-primary" />
              <p className="text-sm text-muted-foreground mt-2">Price: $200 - $500</p>
            </FilterSection>

            <FilterSection title="Brands">
              <div className="space-y-2">
                {brands.map(brand => (
                  <label key={brand} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="rounded border-border accent-primary"
                    />
                    {brand} ({brandCounts.get(brand) || 0})
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Sizes">
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button key={size} className="px-3 py-1.5 border border-border rounded text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    {size}
                  </button>
                ))}
              </div>
            </FilterSection>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <strong className="text-foreground">{rangeStart}-{rangeEnd}</strong> of {allProducts.length} results
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="appearance-none px-3 py-2 pr-8 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {isLoading ? <p className="mb-4 text-sm text-muted-foreground">Loading products...</p> : null}
            {loadError ? <p className="mb-4 text-sm text-red-500">{loadError}</p> : null}
            {!isLoading && !loadError && allProducts.length === 0 ? (
              <p className="mb-4 text-sm text-muted-foreground">No products found for selected categories.</p>
            ) : null}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {paginatedProducts.map(p => <ProductCard key={`${p.id}-${p.slug}`} product={p} />)}
            </div>

            {!isLoading && !loadError && allProducts.length > productsPerPage ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(previous => Math.max(1, previous - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      page === currentPage
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage(previous => Math.min(totalPages, previous + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
