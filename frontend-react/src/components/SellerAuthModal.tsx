import { FormEvent, useEffect, useState } from "react";

import { panelAuthService } from "@/services/panelAuthService";

type SellerAuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
};

type RegisterFormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

const initialRegisterForm: RegisterFormState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

export const SellerAuthModal = ({ open, onClose, initialMode = "login" }: SellerAuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  const [loginEmail, setLoginEmail] = useState("seller@shopo.com");
  const [loginPassword, setLoginPassword] = useState("Seller@123");
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState<RegisterFormState>(initialRegisterForm);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [initialMode, open]);

  if (!open) {
    return null;
  }

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    setLoginLoading(true);

    try {
      const result = await panelAuthService.sellerLogin({ email: loginEmail, password: loginPassword });
      localStorage.setItem("sellerToken", result.token);
      localStorage.setItem("sellerUser", JSON.stringify(result.user));
      setSuccess("Seller login successful.");
      window.setTimeout(() => {
        window.location.assign("/admin/seller/dashboard");
      }, 500);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Seller login failed";
      setError(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Password and confirm password must match");
      return;
    }

    setRegisterLoading(true);

    try {
      await panelAuthService.sellerRegister(registerForm);
      setSuccess("Seller account created successfully. Please login.");
      setRegisterForm(initialRegisterForm);
      setMode("login");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Seller registration failed";
      setError(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-display text-foreground">Seller Access</h3>
            <p className="text-xs text-muted-foreground">Use seller account without leaving this page</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-secondary"
            aria-label="Close seller auth modal"
          >
            X
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-md bg-secondary p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              resetMessages();
            }}
            className={`rounded px-3 py-2 text-sm font-medium ${mode === "login" ? "bg-background text-foreground" : "text-muted-foreground"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              resetMessages();
            }}
            className={`rounded px-3 py-2 text-sm font-medium ${mode === "register" ? "bg-background text-foreground" : "text-muted-foreground"}`}
          >
            Register
          </button>
        </div>

        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        {success ? <p className="mb-3 text-sm text-green-600">{success}</p> : null}

        {mode === "login" ? (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Seller Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={event => setLoginEmail(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={event => setLoginPassword(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-md bg-foreground py-2.5 text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loginLoading ? "Signing in..." : "Sign In as Seller"}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Full Name</label>
              <input
                type="text"
                value={registerForm.fullName}
                onChange={event => setRegisterForm(current => ({ ...current, fullName: event.target.value }))}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={event => setRegisterForm(current => ({ ...current, email: event.target.value }))}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Phone Number</label>
              <input
                type="tel"
                value={registerForm.phoneNumber}
                onChange={event => setRegisterForm(current => ({ ...current, phoneNumber: event.target.value }))}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={event => setRegisterForm(current => ({ ...current, password: event.target.value }))}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Confirm Password</label>
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={event => setRegisterForm(current => ({ ...current, confirmPassword: event.target.value }))}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={registerLoading}
              className="w-full rounded-md bg-foreground py-2.5 text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {registerLoading ? "Creating account..." : "Create Seller Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
