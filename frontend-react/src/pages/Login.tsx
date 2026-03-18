import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { useState } from "react";
import { SellerAuthModal } from "@/components/SellerAuthModal";

const Login = () => {
  const [isSellerModalOpen, setSellerModalOpen] = useState(false);

  return (
  <Layout>
    <section className="py-16">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 bg-card rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold font-display text-foreground text-center mb-8">Log In</h2>
          <form className="space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Email Address*</label>
              <input type="email" placeholder="Demo@gmail.com" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Password*</label>
              <input type="password" placeholder="● ● ● ● ● ●" className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border accent-primary" />
                Remember Me
              </label>
              {/* <a href="#" className="text-sm text-primary hover:underline">Forgot Password</a> */}
            </div>
            <button type="button" className="w-full py-3 bg-foreground text-background font-semibold rounded-md hover:opacity-90 transition-opacity">
              Log In
            </button>
            {/* <button type="button" className="w-full py-3 border border-border rounded-md text-foreground font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign In with Google
            </button> */}
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up free</Link>
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Panel access: <Link to="/admin/login" className="text-primary font-medium hover:underline">Admin</Link> or <button type="button" onClick={() => setSellerModalOpen(true)} className="text-primary font-medium hover:underline">Seller</button>
          </p>
        </div>

        {/* Illustration placeholder */}
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
    <SellerAuthModal open={isSellerModalOpen} onClose={() => setSellerModalOpen(false)} />
  </Layout>
);
};

export default Login;
