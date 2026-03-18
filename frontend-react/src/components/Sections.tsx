import { useState, useEffect } from "react";
import { Truck, RotateCcw, Shield, Award, ChevronRight, Smartphone } from "lucide-react";

export const FlashSale = () => {
  const [time, setTime] = useState({ days: 2, hours: 14, minutes: 36, seconds: 45 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12">
      <div className="container mx-auto">
        <div className="bg-primary rounded-xl p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              {(["Days", "Hours", "Minutes", "Seconds"] as const).map((label, i) => (
                <div key={label} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-primary-foreground font-display">
                    {String([time.days, time.hours, time.minutes, time.seconds][i]).padStart(2, "0")}
                  </div>
                  <div className="text-xs text-primary-foreground/70 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">WOO! Flash Sale</h3>
            <p className="text-primary-foreground/80 mb-4">Someone's top picks every day, amazing deals and discount.</p>
            <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-background text-foreground rounded-md font-semibold hover:opacity-90 transition-opacity">
              Shop Now <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="text-primary-foreground/20">
            <ShieldIcon />
          </div>
        </div>
      </div>
    </section>
  );
};

const ShieldIcon = () => <Shield className="w-32 h-32" />;

export const MobileAppSection = () => (
  <section className="py-16 bg-secondary">
    <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1">
        <p className="text-sm font-semibold text-primary mb-2 tracking-widest uppercase">Mobile App Version</p>
        <h2 className="text-3xl lg:text-4xl font-bold font-display text-foreground mb-4 leading-tight">
          Get Our Mobile App<br />It Makes Life Easier!
        </h2>
        <div className="flex gap-4 mt-6">
          <a href="#" className="px-6 py-3 bg-foreground text-background rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> Google Play
          </a>
          <a href="#" className="px-6 py-3 bg-foreground text-background rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> App Store
          </a>
        </div>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="w-64 h-[500px] bg-foreground/5 rounded-3xl border-4 border-foreground/10 flex items-center justify-center text-muted-foreground">
          <Smartphone className="w-20 h-20" />
        </div>
      </div>
    </div>
  </section>
);

export const FeaturesBar = () => {
  const features = [
    { icon: Truck, title: "Free Shipping", desc: "When ordering over $100" },
    { icon: RotateCcw, title: "Free Return", desc: "Get Return within 30 days" },
    { icon: Shield, title: "Secure Payment", desc: "100% Secure Online Payment" },
    { icon: Award, title: "Best Quality", desc: "Original Product Guaranteed" },
  ];

  return (
    <section className="py-12 bg-background border-t border-border">
      <div className="container mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(f => (
          <div key={f.title} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
              <f.icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">{f.title}</h4>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const Footer = () => (
  <footer className="bg-foreground text-background/70 py-12">
    <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-lg font-bold text-background mb-4 font-display"><span className="text-primary">●</span> ShopO</h3>
        <p className="text-sm leading-relaxed">Your one-stop shop for the latest tech gadgets and accessories at unbeatable prices.</p>
      </div>
      {[
        { title: "Features", links: ["About Us", "Terms", "Best Products", "Return Policy"] },
        { title: "General Links", links: ["Blog", "Tracking Order", "Become a Seller", "FAQ"] },
        { title: "Helpful", links: ["Flash Sale", "Support", "Contact Us", "Privacy Policy"] },
      ].map(col => (
        <div key={col.title}>
          <h4 className="font-semibold text-background mb-4">{col.title}</h4>
          <ul className="space-y-2">
            {col.links.map(link => (
              <li key={link}>
                <a href="#" className="text-sm hover:text-background transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="container mx-auto mt-10 pt-6 border-t border-background/10 text-center text-sm">
      © 2026 ShopO. All rights reserved.
    </div>
  </footer>
);
