import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthLayout } from "../../layouts/AuthLayout.tsx";
import { sellerPortalService } from "../../services/sellerPortalService.ts";

export const SellerRegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {   
      await sellerPortalService.register({
        fullName,
        email,
        phoneNumber,
        password,
        confirmPassword,
      });
      toast.success("Seller account created. Please login.");
      navigate("/seller/login", { replace: true });
    } catch (submitError) {
      const submitMessage = submitError instanceof Error ? submitError.message : "Registration failed";
      setError(submitMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Seller Registration">
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField label="Full Name" value={fullName} onChange={event => setFullName(event.target.value)} fullWidth />
        <TextField label="Email" value={email} onChange={event => setEmail(event.target.value)} fullWidth />
        <TextField label="Phone Number" value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)} fullWidth />
        <TextField label="Password" type="password" value={password} onChange={event => setPassword(event.target.value)} fullWidth />
        <TextField label="Confirm Password" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} fullWidth />
        <Button variant="contained" size="large" onClick={() => void handleSubmit()} disabled={loading}>Create Seller Account</Button>

        <Box display="flex" justifyContent="space-between">
          <Link to="/seller/login"><Typography variant="body2">Already have an account? Login</Typography></Link>
        </Box>
      </Stack>
    </AuthLayout>
  );
};
