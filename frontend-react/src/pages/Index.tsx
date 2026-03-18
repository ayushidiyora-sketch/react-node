import { Layout } from "@/components/Layout";
import { HeroBanner } from "@/components/HeroBanner";
import { BrandSlider } from "@/components/BrandSlider";
import { ProductSection } from "@/components/ProductCard";
import { FlashSale, MobileAppSection, FeaturesBar } from "@/components/Sections";
import type { Product } from "@/lib/products";
import { normalizeStoreProduct, productService, type StoreProductItem } from "@/services/productService";
import { useEffect, useState } from "react";

type SectionKey = "newArrivals" | "gamerWorld" | "topSelling" | "popularSales";

type SectionState = {
  products: Product[];
  isLoading: boolean;
  error: string;
};

const initialSectionState: SectionState = {
  products: [],
  isLoading: true,
  error: "",
};

const sectionTitles: Record<SectionKey, string> = {
  newArrivals: "New Arrivals",
  gamerWorld: "Gamer World",
  topSelling: "Top Selling Products",
  popularSales: "Popular Sales",
};

const SectionBlock = ({ title, state }: { title: string; state: SectionState }) => {
  if (state.isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold font-display text-foreground mb-4">{title}</h2>
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </section>
    );
  }

  if (state.error) {
    return (
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold font-display text-foreground mb-4">{title}</h2>
          <p className="text-sm text-red-500">{state.error}</p>
        </div>
      </section>
    );
  }

  if (!state.products.length) {
    return (
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold font-display text-foreground mb-4">{title}</h2>
          <p className="text-sm text-muted-foreground">No products found.</p>
        </div>
      </section>
    );
  }

  return <ProductSection title={title} products={state.products} />;
};

const Index = () => {
  const [sectionData, setSectionData] = useState<Record<SectionKey, SectionState>>({
    newArrivals: { ...initialSectionState },
    gamerWorld: { ...initialSectionState },
    topSelling: { ...initialSectionState },
    popularSales: { ...initialSectionState },
  });

  useEffect(() => {
    let isMounted = true;

    const loadSections = async () => {
      const loaders: Array<[SectionKey, () => Promise<StoreProductItem[]>]> = [
        ["newArrivals", () => productService.getNewArrivals(8)],
        ["gamerWorld", () => productService.getGamerWorld(8)],
        ["topSelling", () => productService.getTopSelling(8)],
        ["popularSales", () => productService.getPopularSales(8)],
      ];

      await Promise.all(
        loaders.map(async ([key, fetcher]) => {
          try {
            const items = await fetcher();
            if (!isMounted) return;

            const products = items.map(normalizeStoreProduct);
            setSectionData(previous => ({
              ...previous,
              [key]: { products, isLoading: false, error: "" },
            }));
          } catch (error) {
            if (!isMounted) return;
            const message = error instanceof Error ? error.message : "Failed to load section.";
            setSectionData(previous => ({
              ...previous,
              [key]: { products: [], isLoading: false, error: message },
            }));
          }
        }),
      );
    };

    void loadSections();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout showNewsletter={false}>
      <HeroBanner />
      <BrandSlider />
      <SectionBlock title={sectionTitles.newArrivals} state={sectionData.newArrivals} />
      <SectionBlock title={sectionTitles.gamerWorld} state={sectionData.gamerWorld} />
      <SectionBlock title={sectionTitles.topSelling} state={sectionData.topSelling} />
      <FlashSale />
      <SectionBlock title={sectionTitles.popularSales} state={sectionData.popularSales} />
      <MobileAppSection />
      <FeaturesBar />
    </Layout>
  );
};

export default Index;
