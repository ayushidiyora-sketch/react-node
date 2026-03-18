import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { panelAuthService } from "@/services/panelAuthService";

const SellerLogin = () => {
  const [email, setEmail] = useState("seller@shopo.com");
  const [password, setPassword] = useState("Seller@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await panelAuthService.sellerLogin({ email, password });
      localStorage.setItem("sellerToken", result.token);
      localStorage.setItem("sellerUser", JSON.stringify(result.user));
      navigate("/admin/seller/dashboard", { replace: true });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Seller login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto max-w-md bg-card rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold font-display text-foreground text-center mb-2">Seller Login</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">Sign in with your seller account.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Seller Email</label>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-foreground text-background font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In as Seller"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            New seller? <Link to="/seller/register" className="text-primary font-medium hover:underline">Create seller account</Link>
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Admin account? <Link to="/admin/login" className="text-primary font-medium hover:underline">Admin login</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default SellerLogin;
