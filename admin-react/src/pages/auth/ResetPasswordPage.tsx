import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AuthLayout } from "../../layouts/AuthLayout.tsx";
import { authService } from "../../services/authService.ts";

export const ResetPasswordPage = () => {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const panel = searchParams.get("panel") === "seller" ? "seller" : "admin";

  const handleSubmit = async () => {
    await authService.resetPassword(token, password);
    setMessage("Password reset successful. Please login again.");
  };

  return (
    <AuthLayout title="Reset Password">
      <Stack spacing={2}>
        <TextField label="Reset Token" fullWidth value={token} onChange={event => setToken(event.target.value)} />
        <TextField label="New Password" type="password" fullWidth value={password} onChange={event => setPassword(event.target.value)} />
        <Button variant="contained" onClick={() => void handleSubmit()}>Reset Password</Button>
        {message ? <Alert severity="success">{message}</Alert> : null}
        <Link to={panel === "seller" ? "/seller/login" : "/admin/login"}><Typography variant="body2">Back to login</Typography></Link>
      </Stack>
    </AuthLayout>
  );
};