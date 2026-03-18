import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const Signup = () => (
  <Layout>
    <section className="py-16">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Signup Form */}
        <div className="w-full max-w-lg mx-auto lg:mx-0 bg-card rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold font-display text-foreground text-center mb-8">Create Account</h2>
          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">First Name*</label>
                <input type="text" placeholder="Demo Name" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Last Name*</label>
                <input type="text" placeholder="Demo Name" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Email Address*</label>
                <input type="email" placeholder="Demo@gmail.com" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Phone*</label>
                <input type="tel" placeholder="0213 *********" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Country*</label>
              <div className="relative">
                <select className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Select Country</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Address*</label>
              <input type="text" placeholder="Your address Here" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Town / City*</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>Miami</option>
                    <option>New York</option>
                    <option>Los Angeles</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Postcode / ZIP*</label>
                <input type="text" placeholder="00000" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" className="rounded border-border accent-primary" />
              I agree all terms and conditions in ShopO.
            </label>
            <button type="button" className="w-full py-3 bg-foreground text-background font-semibold rounded-md hover:opacity-90 transition-opacity">
              Create Account
            </button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an Account? <Link to="/login" className="text-primary font-medium hover:underline">Log In</Link>
          </p>
        </div>

        {/* Illustration */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="w-96 h-96 bg-secondary rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <p className="text-muted-foreground font-medium">Shop now</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default Signup;
