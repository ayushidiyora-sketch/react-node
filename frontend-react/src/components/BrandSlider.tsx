export const BrandSlider = () => {
  const brands = [
    "ONEPLUS",
    "Tencent",
    "Apple",
    "Microsoft",
    "Lenovo",
    "HUAWEI",
    "nexus",
    "Google",
    "Firefox",
    "TESLA",
    "brave",
    "facebook",
  ];

  const trackBrands = [...brands, ...brands];

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
              key={`${brand}-${index}`}
              className="flex h-24 min-w-[190px] items-center justify-center border border-[#d7d7db] bg-[#f7f7f8] px-6 text-3xl font-semibold tracking-tight text-[#30343f] md:h-28 md:min-w-[230px]"
            >
              <span className="select-none">{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
