import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-vr.png";

const slides = [
  { subtitle: "VR BOX 3D Glass", title: "Explore Our Tech Collection Perfect Gadget", image: heroImg },
  { subtitle: "VR BOX 3D Glass", title: "Explore Our Tech Collection Perfect ", image: heroImg },
  { subtitle: "VR BOX 3D Glass", title: "Explore Our Tech Collection  Gadget", image: heroImg },
];

export const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="relative bg-secondary overflow-hidden">
      <div className="container mx-auto flex items-center min-h-[500px] lg:min-h-[600px]">
        <div className="relative z-10 max-w-lg py-16">
          <p className="text-muted-foreground text-lg mb-3">{slides[current].subtitle}</p>
          <h1 className="text-4xl lg:text-6xl font-bold font-display text-foreground leading-tight mb-8">
            {slides[current].title}
          </h1>
          <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity">
            Shop Now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="hidden md:block absolute right-0 top-0 h-full w-1/2">
          <img
            src={slides[current].image}
            alt="Hero VR headset"
            className="h-full w-full object-contain object-right-bottom"
          />
        </div>
      </div>
      <button
        onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-background/50"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrent(c => (c + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-background/50"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};
