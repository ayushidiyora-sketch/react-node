import { useState } from "react";

export const NewsletterBanner = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="bg-primary py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">
          Get 20% Off Discount Coupon
        </h2>
        <p className="text-primary-foreground/80 mb-6">by Subscribe our Newsletter</p>
        <div className="flex items-center max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-l-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button className="px-6 py-3 bg-foreground text-background font-semibold rounded-r-md hover:opacity-90 transition-opacity">
            Get the Coupon
          </button>
        </div>
      </div>
    </section>
  );
};
