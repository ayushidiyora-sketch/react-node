import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Alert, Box, Button, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { writeSellerSession } from "@/lib/sellerSession";
import { productService } from "@/services/productService";
import { sellerPortalService } from "@/services/sellerPortalService";

type SellerProfileForm = {
  profileImage: string;
  sellerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  companyName: string;
  brandName: string;
  gstNumber: string;
  websiteUrl: string;
};

const initialState: SellerProfileForm = {
  profileImage: "",
  sellerName: "",
  email: "",
  phoneNumber: "",
  address: "",
  companyName: "",
  brandName: "",
  gstNumber: "",
  websiteUrl: "",
};

export const SellerProfilePage = () => {
  const [form, setForm] = useState<SellerProfileForm>(initialState);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const profileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (profilePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
    };
  }, [profilePreviewUrl]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await sellerPortalService.getProfile();
        setForm({
          profileImage: profile.profileImage || "",
          sellerName: profile.sellerName || "",
          email: profile.email || "",
          phoneNumber: profile.phoneNumber || "",
          address: profile.address || "",
          companyName: profile.companyName || "",
          brandName: profile.brandName || "",
          gstNumber: profile.gstNumber || "",
          websiteUrl: profile.websiteUrl || "",
        });
        setProfilePreviewUrl(profile.profileImage || "");
        writeSellerSession({
          name: profile.sellerName || "Seller",
          fullName: profile.sellerName || "Seller",
          email: profile.email || "",
          profileImage: profile.profileImage || "",
        });
      } catch (loadError) {
        const loadMessage = loadError instanceof Error ? loadError.message : "Unable to fetch profile";
        setError(loadMessage);
      }
    };

    void loadProfile();
  }, []);

  const setField = (key: keyof SellerProfileForm, value: string) => setForm(previous => ({ ...previous, [key]: value }));

  const handleProfileImageSelect = (file: File | null) => {
    if (profilePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(profilePreviewUrl);
    }

    if (!file) {
      setProfileImageFile(null);
      setProfilePreviewUrl("");
      setField("profileImage", "");
      return;
    }

    setProfileImageFile(file);
    setProfilePreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const [uploadedProfileImage] = profileImageFile ? await productService.uploadImages([profileImageFile]) : [""];
      const savedProfile = await sellerPortalService.updateProfile({
        ...form,
        profileImage: uploadedProfileImage || form.profileImage,
      });
      setForm({
        profileImage: savedProfile.profileImage || "",
        sellerName: savedProfile.sellerName || "",
        email: savedProfile.email || "",
        phoneNumber: savedProfile.phoneNumber || "",
        address: savedProfile.address || "",
        companyName: savedProfile.companyName || "",
        brandName: savedProfile.brandName || "",
        gstNumber: savedProfile.gstNumber || "",
        websiteUrl: savedProfile.websiteUrl || "",
      });
      setProfileImageFile(null);
      setProfilePreviewUrl(savedProfile.profileImage || "");
      writeSellerSession({
        name: savedProfile.sellerName || "Seller",
        fullName: savedProfile.sellerName || "Seller",
        email: savedProfile.email || "",
        profileImage: savedProfile.profileImage || "",
      });
      toast.success("Seller profile updated.");
    } catch (saveError) {
      const saveMessage = saveError instanceof Error ? saveError.message : "Unable to save profile";
      setError(saveMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">SELLER PROFILE</Typography>
      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Typography variant="body2" sx={{ color: "var(--skote-subtle)" }}>Profile Image</Typography>
          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={event => {
              const file = event.target.files?.[0] ?? null;
              handleProfileImageSelect(file);
              event.target.value = "";
            }}
          />
          <Box
            onClick={() => profileInputRef.current?.click()}
            sx={{
              border: "1px dashed #d3d7e3",
              borderRadius: 2,
              minHeight: 120,
              display: "grid",
              placeItems: "center",
              bgcolor: "#fcfcfd",
              cursor: "pointer",
            }}
          >
            <Stack spacing={1} alignItems="center">
              <CloudUploadRoundedIcon sx={{ fontSize: 34, color: "#7b8197" }} />
              <Typography color="var(--skote-subtle)">Click to upload profile image.</Typography>
              <Typography variant="caption" color="var(--skote-subtle)">{profileImageFile ? profileImageFile.name : "No new image selected"}</Typography>
            </Stack>
          </Box>
          {profilePreviewUrl ? (
            <Box>
              <img src={profilePreviewUrl} alt="Profile preview" style={{ width: 120, height: 120, borderRadius: 12, objectFit: "cover", border: "1px solid #e0e0e0" }} />
              <Stack direction="row" spacing={1} mt={1}>
                <Button size="small" variant="outlined" onClick={() => profileInputRef.current?.click()}>Change</Button>
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Remove profile image"
                  onClick={() => handleProfileImageSelect(null)}
                  sx={{ border: "1px solid", borderColor: "error.main", borderRadius: 1 }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ) : null}
          <TextField label="Seller Name" value={form.sellerName} onChange={event => setField("sellerName", event.target.value)} />
          <TextField label="Email" value={form.email} onChange={event => setField("email", event.target.value)} />
          <TextField label="Phone Number" value={form.phoneNumber} onChange={event => setField("phoneNumber", event.target.value)} />
          <TextField label="Address" value={form.address} onChange={event => setField("address", event.target.value)} />
          <TextField label="Company Name" value={form.companyName} onChange={event => setField("companyName", event.target.value)} />
          <TextField label="Brand Name" value={form.brandName} onChange={event => setField("brandName", event.target.value)} />
          <TextField label="GST Number (optional)" value={form.gstNumber} onChange={event => setField("gstNumber", event.target.value)} />
          <TextField label="Website URL (optional)" value={form.websiteUrl} onChange={event => setField("websiteUrl", event.target.value)} />
          <Button variant="contained" onClick={() => void handleSave()} disabled={loading}>Save Profile</Button>
        </Stack>
      </Paper>
    </Stack>
  );
};


