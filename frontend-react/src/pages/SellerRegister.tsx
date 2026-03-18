import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { panelAuthService } from "@/services/panelAuthService";

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

const initialForm: FormState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

const SellerRegister = () => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const updateField = (field: keyof FormState, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password must match");
      return;
    }

    setLoading(true);

    try {
      await panelAuthService.sellerRegister(form);
      setSuccess("Seller account created successfully. You can now log in.");
      setForm(initialForm);
      window.setTimeout(() => {
        navigate("/seller/login", { replace: true });
      }, 700);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Seller registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto max-w-md bg-card rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold font-display text-foreground text-center mb-2">Seller Register</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">Create a seller account to access seller tools.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-green-600">{success}</p> : null}

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={event => updateField("fullName", event.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={event => updateField("email", event.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Phone Number</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={event => updateField("phoneNumber", event.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={event => updateField("password", event.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={event => updateField("confirmPassword", event.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-foreground text-background font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Seller Account"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already a seller? <Link to="/seller/login" className="text-primary font-medium hover:underline">Seller login</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default SellerRegister;
