import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthLayout } from "../../layouts/AuthLayout.tsx";
import { useAppDispatch } from "../../hooks/useAppDispatch.ts";
import { setCredentials } from "../../store/slices/authSlice.ts";

type LoginApiResponse = {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "seller";
    mustChangePassword?: boolean;
  };
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

type LoginPageProps = {
  panelRole: "admin" | "seller";
};

export const LoginPage = ({ panelRole }: LoginPageProps) => {
  const [email, setEmail] = useState(panelRole === "seller" ? "seller@shopo.com" : "admin@shopo.com");
  const [password, setPassword] = useState(panelRole === "seller" ? "Seller@123" : "Admin@123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as { from?: string } | undefined)?.from;

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const loginPath = panelRole === "admin" ? "/api/admin/login" : "/api/seller/login";

      const response = await fetch(`${apiBaseUrl}${loginPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginApiResponse;

      if (!response.ok || !data.success || !data.token || !data.user) {
        throw new Error(data.message || "Invalid credentials.");
      }

      if (data.user.role !== panelRole) {
        throw new Error("You are not authorized to access this login panel.");
      }

      dispatch(
        setCredentials({
          token: data.token,
          admin: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            mustChangePassword: Boolean(data.user.mustChangePassword),
          },
        }),
      );

      toast.success("Welcome back.");
      if (data.user.mustChangePassword) {
        navigate(data.user.role === "seller" ? "/seller/change-password" : "/admin/change-password", { replace: true });
        return;
      }

      navigate(redirectPath ?? (data.user.role === "seller" ? "/seller" : "/admin"), { replace: true });
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Invalid credentials.";
      const normalizedMessage = message.toLowerCase().includes("failed to fetch")
        ? "Unable to reach backend API. Ensure shopo-backend is running on http://localhost:5000."
        : message;
      setError(normalizedMessage);
      console.error(loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={panelRole === "seller" ? "Seller Login" : "Admin Login"} panelRole={panelRole}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField label="Email" value={email} onChange={event => setEmail(event.target.value)} fullWidth />
        <TextField label="Password" type="password" value={password} onChange={event => setPassword(event.target.value)} fullWidth />

        <Button variant="contained" size="large" onClick={() => void handleLogin()} disabled={loading}>
          Login
        </Button>

        {/* <Button variant="outlined" size="large" onClick={() => void handleGoogleLogin()} disabled={loading}>
          Login with Google
        </Button> */}

        <Box display="flex" justifyContent="space-between">
          <Link to={`/forgot-password?panel=${panelRole}`}><Typography variant="body2">Forgot Password?</Typography></Link>
          {panelRole === "seller" ? <Link to="/seller/register"><Typography variant="body2">Seller Register</Typography></Link> : null}
        </Box>
      </Stack>
    </AuthLayout>
  );
};