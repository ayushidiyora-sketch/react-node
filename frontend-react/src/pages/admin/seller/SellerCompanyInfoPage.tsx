import { Alert, Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { sellerPortalService } from "@/services/sellerPortalService";

type CompanyInfoForm = {
  brandName: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNumber: string;
  websiteUrl: string;
};

const initialState: CompanyInfoForm = {
  brandName: "",
  companyName: "",
  phoneNumber: "",
  email: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  gstNumber: "",
  websiteUrl: "",
};

export const SellerCompanyInfoPage = () => {
  const [form, setForm] = useState<CompanyInfoForm>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const info = await sellerPortalService.getCompanyInfo();
        setForm({
          brandName: info.brandName || "",
          companyName: info.companyName || "",
          phoneNumber: info.phoneNumber || "",
          email: info.email || "",
          address: info.address || "",
          city: info.city || "",
          state: info.state || "",
          country: info.country || "",
          pincode: info.pincode || "",
          gstNumber: info.gstNumber || "",
          websiteUrl: info.websiteUrl || "",
        });
      } catch (loadError) {
        const loadMessage = loadError instanceof Error ? loadError.message : "Unable to fetch company info";
        setError(loadMessage);
      }
    };

    void loadCompanyInfo();
  }, []);

  const setField = (key: keyof CompanyInfoForm, value: string) => setForm(previous => ({ ...previous, [key]: value }));

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      await sellerPortalService.updateCompanyInfo(form);
      toast.success("Company information updated.");
    } catch (saveError) {
      const saveMessage = saveError instanceof Error ? saveError.message : "Unable to save company info";
      setError(saveMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">COMPANY INFORMATION</Typography>
      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Brand Name" value={form.brandName} onChange={event => setField("brandName", event.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Company Name" value={form.companyName} onChange={event => setField("companyName", event.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Phone Number" value={form.phoneNumber} onChange={event => setField("phoneNumber", event.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email" value={form.email} onChange={event => setField("email", event.target.value)} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Address" value={form.address} onChange={event => setField("address", event.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="City" value={form.city} onChange={event => setField("city", event.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="State" value={form.state} onChange={event => setField("state", event.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Country" value={form.country} onChange={event => setField("country", event.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Pincode" value={form.pincode} onChange={event => setField("pincode", event.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="GST Number" value={form.gstNumber} onChange={event => setField("gstNumber", event.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Website URL" value={form.websiteUrl} onChange={event => setField("websiteUrl", event.target.value)} /></Grid>
          </Grid>
          <Button variant="contained" onClick={() => void handleSave()} disabled={loading}>Save Company Info</Button>
        </Stack>
      </Paper>
    </Stack>
  );
};


