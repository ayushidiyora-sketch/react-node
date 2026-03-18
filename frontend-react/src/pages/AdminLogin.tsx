import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { panelAuthService } from "@/services/panelAuthService";
import { SellerAuthModal } from "@/components/SellerAuthModal";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSellerModalOpen, setSellerModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await panelAuthService.adminLogin({ email, password });
      localStorage.setItem("adminToken", result.token);
      localStorage.setItem("adminUser", JSON.stringify(result.user));
      navigate("/", { replace: true });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Admin login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto max-w-md bg-card rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold font-display text-foreground text-center mb-2">Admin Login</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">Sign in with an administrator account.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Admin Email</label>
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
              {loading ? "Signing in..." : "Sign In as Admin"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Seller account? <button type="button" onClick={() => setSellerModalOpen(true)} className="text-primary font-medium hover:underline">Seller login</button>
          </p>
        </div>
      </section>
      <SellerAuthModal open={isSellerModalOpen} onClose={() => setSellerModalOpen(false)} />
    </Layout>
  );
};

export default AdminLogin;
