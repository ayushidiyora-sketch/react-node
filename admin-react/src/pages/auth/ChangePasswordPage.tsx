import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.ts";
import { useAppDispatch } from "../../hooks/useAppDispatch.ts";
import { updateAdminProfile } from "../../store/slices/authSlice.ts";

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

export const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, role } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!token) {
        throw new Error("Please login again.");
      }

      const changePasswordPath = "/api/auth/change-password";

      const response = await fetch(`${apiBaseUrl}${changePasswordPath}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Unable to change password");
      }

      dispatch(updateAdminProfile({ mustChangePassword: false }));
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password changed successfully.");
      navigate(role === "seller" ? "/seller" : "/admin", { replace: true });
    } catch (submitError) {
      const submitMessage = submitError instanceof Error ? submitError.message : "Unable to change password";
      setError(submitMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Change Password</Typography>
      <Stack spacing={2} maxWidth={520}>
        <TextField label="Current Password" type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} />
        <TextField label="New Password" type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} />
        <Button variant="contained" onClick={() => void handleSubmit()} disabled={loading}>Update Password</Button>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {message ? <Alert severity="success">{message}</Alert> : null}
      </Stack>
    </Paper>
  );
};