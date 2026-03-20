import { useEffect, useMemo, useState } from "react";

import { sellerService, type SellerBrandLogoItem } from "@/services/sellerService";
import { toAbsoluteMediaUrl } from "@/utils/mediaUrl";

const toAbsoluteLogoUrl = (value: string) => {
  return toAbsoluteMediaUrl(value, { defaultUploadPath: "/uploads/sellers" });
};

export const BrandSlider = () => {
  const [logos, setLogos] = useState<SellerBrandLogoItem[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadBrandLogos = async () => {
      try {
        const items = await sellerService.getPublicBrandLogos();

        if (!mounted) {
          return;
        }

        const cleaned = items
          .map(item => ({
            ...item,
            logo: toAbsoluteLogoUrl(item.logo),
          }))
          .filter(item => Boolean(item.logo));

        setLogos(cleaned);
      } catch {
        if (mounted) {
          setLogos([]);
        }
      }
    };

    void loadBrandLogos();

    return () => {
      mounted = false;
    };
  }, []);

  const trackBrands = useMemo(() => (logos.length ? [...logos, ...logos] : []), [logos]);

  if (!trackBrands.length) {
    return null;
  }

  return (
    <section className="w-full overflow-hidden bg-[#efefef] py-6 md:py-8">
      <style>
        {`
          @keyframes brand-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>

      <div className="w-full">
        <div
          className="flex w-max items-stretch"
          style={{ animation: "brand-marquee 26s linear infinite" }}
        >
          {trackBrands.map((brand, index) => (
            <div
              key={`${brand.logo}-${index}`}
              className="flex h-24 min-w-[190px] items-center justify-center border border-[#d7d7db] bg-[#f7f7f8] px-6 md:h-28 md:min-w-[230px]"
            >
              <img
                src={brand.logo}
                alt={brand.brandName || brand.shopName || "Brand logo"}
                className="h-12 w-auto max-w-[140px] object-contain md:h-14 md:max-w-[170px]"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
