import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { FeaturesBar } from "@/components/Sections";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import productsGrid from "@/assets/products-grid.jpg";

const testimonials = [
  { name: "Ridoy Rock", location: "London, UK", rating: 5, text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book." },
  { name: "Sarah Chen", location: "New York, US", rating: 5, text: "It has survived not only five centuries but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets." },
  { name: "Alex Kumar", location: "Toronto, CA", rating: 5, text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words." },
];

const About = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  return (
    <Layout showNewsletter={false}>
      <PageBanner title="About Us" breadcrumbs={[{ label: "Home", path: "/" }, { label: "About Us" }]} />

      {/* About Content */}
      <section className="py-16">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <img src={productsGrid} alt="About ShopO" className="rounded-lg w-full max-w-lg" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl lg:text-3xl font-bold font-display text-foreground mb-6">What is e-commerce business?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries but also the on leap into electronic typesetting.
            </p>
            <ul className="space-y-2 text-muted-foreground mb-8">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> slim body with metal cover</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> latest Intel Core i5-1135G7 processor (4 cores / 8 threads)</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> 8GB DDR4 RAM and fast 512GB PCIe SSD</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> NVIDIA GeForce MX350 2GB GDDR5 graphics card backlit keyboard</li>
            </ul>
            <a href="/contact" className="inline-flex px-6 py-3 bg-accent text-accent-foreground rounded-md font-semibold hover:opacity-90 transition-opacity">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold font-display text-foreground text-center mb-12">Customers Feedback</h2>
          <div className="relative max-w-2xl mx-auto">
            <div className="bg-card rounded-lg p-8 text-center border border-border">
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < testimonials[currentTestimonial].rating ? "text-star fill-current" : "text-muted-foreground"}`} />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">{testimonials[currentTestimonial].text}</p>
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center text-primary font-bold text-xl">
                {testimonials[currentTestimonial].name[0]}
              </div>
              <h4 className="font-semibold text-foreground">{testimonials[currentTestimonial].name}</h4>
              <p className="text-sm text-muted-foreground">{testimonials[currentTestimonial].location}</p>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={() => setCurrentTestimonial(c => (c - 1 + testimonials.length) % testimonials.length)} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCurrentTestimonial(c => (c + 1) % testimonials.length)} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <FeaturesBar />
    </Layout>
  );
};

export default About;
