import { Alert, Avatar, Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAppDispatch } from "../../hooks/useAppDispatch.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { authService } from "../../services/authService.ts";
import { updateAdminProfile } from "../../store/slices/authSlice.ts";

export const AdminProfilePage = () => {
  const { admin, token } = useAuth();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(admin?.name ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(admin?.name ?? "");
    setEmail(admin?.email ?? "");
  }, [admin?.name, admin?.email]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        return;
      }

      try {
        const profile = await authService.getProfile(token);
        dispatch(updateAdminProfile(profile));
      } catch {
        // Keep local state as fallback if profile fetch fails.
      }
    };

    void loadProfile();
  }, [dispatch, token]);

  const hasChanges = useMemo(
    () => name.trim() !== (admin?.name ?? "") || email.trim().toLowerCase() !== (admin?.email ?? "").toLowerCase(),
    [admin?.email, admin?.name, email, name],
  );

  const resetForm = () => {
    setName(admin?.name ?? "");
    setEmail(admin?.email ?? "");
    setError("");
  };

  const saveProfile = async () => {
    if (!token) {
      setError("You are not authenticated.");
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const updated = await authService.updateProfile(token, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      dispatch(updateAdminProfile(updated));
      toast.success("Profile updated successfully.");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to update profile";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 64, height: 64, bgcolor: "#556ee6", fontSize: 24 }}>
            {admin?.name?.[0] ?? "A"}
          </Avatar>
          <BoxContent label="Admin Profile" value="View account details" />
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)" mb={2}>
          Account Information
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <LabelValue label="Role" value={(admin?.role ?? "admin").toUpperCase()} />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1.2} mt={2.2}>
          <Button variant="contained" onClick={() => void saveProfile()} disabled={isSaving || !hasChanges}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outlined" onClick={resetForm} disabled={isSaving || !hasChanges}>
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

const LabelValue = ({ label, value }: { label: string; value: string }) => (
  <Paper variant="outlined" sx={{ p: 1.6, borderRadius: 2, borderColor: "var(--skote-border)", boxShadow: "none" }}>
    <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>
      {label}
    </Typography>
    <Typography fontWeight={600} color="var(--skote-heading)" mt={0.6}>
      {value}
    </Typography>
  </Paper>
);

const BoxContent = ({ label, value }: { label: string; value: string }) => (
  <Stack>
    <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: "var(--skote-subtle)" }}>
      {value}
    </Typography>
  </Stack>
);
