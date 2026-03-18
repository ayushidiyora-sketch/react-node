import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "How does information technology work?", a: "There are many variations of passages of Lorem Ipsum available into the but the majority have suffered alteration in some form, by injecte find to a humour, or randomised words." },
  { q: "How can I become IT manager?", a: "There are many variations of passages of Lorem Ipsum available into the but the majority have suffered alteration in some form, by injecte find to a humour, or randomised words." },
  { q: "What are the latest trends in IT?", a: "There are many variations of passages of Lorem Ipsum available into the but the majority have suffered alteration in some form, by injecte find to a humour, or randomised words." },
  { q: "How long should a business plan be?", a: "There are many variations of passages of Lorem Ipsum available into the but the majority have suffered alteration in some form, by injecte find to a humour, or randomised words." },
  { q: "How work the support policy?", a: "There are many variations of passages of Lorem Ipsum available into the but the majority have suffered alteration in some form, by injecte find to a humour, or randomised words." },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(1);

  return (
    <Layout>
      <PageBanner title="Frequently Asked Questions" breadcrumbs={[{ label: "Home", path: "/" }, { label: "FAQ" }]} />

      <section className="py-16">
        <div className="container mx-auto flex flex-col lg:flex-row gap-12">
          {/* FAQ Accordion */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold font-display text-foreground mb-6">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className={`rounded-lg overflow-hidden border ${openIndex === i ? "border-accent bg-accent" : "border-border bg-card"}`}>
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                    className={`w-full flex items-center justify-between px-6 py-4 text-left font-medium ${openIndex === i ? "text-accent-foreground" : "text-foreground"}`}
                  >
                    <span>{String(i + 1).padStart(2, "0")}. {faq.q}</span>
                    {openIndex === i ? <Minus className="w-4 h-4 shrink-0" /> : <Plus className="w-4 h-4 shrink-0" />}
                  </button>
                  {openIndex === i && (
                    <div className="px-6 pb-4 text-sm text-accent-foreground/80 leading-relaxed">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Question Form */}
          <div className="flex-1">
            <div className="bg-card rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold font-display text-foreground text-center mb-8">Have Any Question</h2>
              <form className="space-y-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">First Name*</label>
                  <input type="text" placeholder="Demo Name" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Email Address*</label>
                  <input type="email" placeholder="info@quomodosoft.com" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Message*</label>
                  <textarea placeholder="Type your message here" rows={5} className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                </div>
                <button type="button" className="w-full py-3 bg-foreground text-background font-semibold rounded-md hover:opacity-90 transition-opacity">
                  Send Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
