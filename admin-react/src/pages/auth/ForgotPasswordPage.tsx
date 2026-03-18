import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AuthLayout } from "../../layouts/AuthLayout.tsx";
import { authService } from "../../services/authService.ts";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const panel = searchParams.get("panel") === "seller" ? "seller" : "admin";

  const handleSubmit = async () => {
    const response = await authService.forgotPassword(email);
    setMessage(`Reset token: ${response.resetToken}`);
  };

  return (
    <AuthLayout title="Forgot Password">
      <Stack spacing={2}>
        <TextField label="Email" fullWidth value={email} onChange={event => setEmail(event.target.value)} />
        <Button variant="contained" onClick={() => void handleSubmit()}>Send Reset Link</Button>
        {message ? <Alert severity="info">{message}</Alert> : null}
        <Link to={panel === "seller" ? "/seller/login" : "/admin/login"}><Typography variant="body2">Back to login</Typography></Link>
      </Stack>
    </AuthLayout>
  );
};