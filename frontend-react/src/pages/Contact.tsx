import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { Phone, Mail, MapPin } from "lucide-react";

const Contact = () => (
  <Layout>
    <PageBanner title="Contact" breadcrumbs={[{ label: "Home", path: "/" }, { label: "Contact" }]} />

    <section className="py-16">
      <div className="container mx-auto flex flex-col lg:flex-row gap-12">
        {/* Contact Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">Contact Information</h2>
          <p className="text-muted-foreground mb-8">Fill the form below or write us. We will help you as soon as possible.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-secondary rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 mx-auto mb-4 flex items-center justify-center">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-3">Phone</h3>
              <p className="text-sm text-muted-foreground">+(323) 9847 3847 383</p>
              <p className="text-sm text-muted-foreground">+(434) 5466 5467 443</p>
            </div>
            <div className="bg-secondary rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-3">Email</h3>
              <p className="text-sm text-muted-foreground">Demoemail@gmail.com</p>
              <p className="text-sm text-muted-foreground">support@shopo.com</p>
            </div>
          </div>

          <div className="bg-secondary rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Address</h3>
                <p className="text-sm text-muted-foreground">4517 Washington Ave. Manchester, Road 2342,</p>
                <p className="text-sm text-muted-foreground">Kentucky 39495</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="flex-1">
          <div className="bg-card rounded-lg border border-border p-8">
            <h2 className="text-2xl font-bold font-display text-foreground text-center mb-8">Get In Touch</h2>
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
                <label className="text-sm text-muted-foreground mb-1.5 block">Subject*</label>
                <input type="text" placeholder="Your Subject here" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
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

export default Contact;
