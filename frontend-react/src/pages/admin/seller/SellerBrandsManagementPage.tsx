import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { productService } from "@/services/productService";
import { sellerPortalService } from "@/services/sellerPortalService";

type SellerBrandItem = Awaited<ReturnType<typeof sellerPortalService.getMyBrands>>[number];

type BrandFormState = {
  brandName: string;
  companyName: string;
  contactEmail: string;
  phoneNumber: string;
  websiteUrl: string;
  description: string;
  address: string;
};

const initialFormState: BrandFormState = {
  brandName: "",
  companyName: "",
  contactEmail: "",
  phoneNumber: "",
  websiteUrl: "",
  description: "",
  address: "",
};

const getStatusChipStyles = (status: SellerBrandItem["status"]) => {
  if (status === "approved") {
    return { bgcolor: "#e8f5e9", color: "#2e7d32" };
  }

  if (status === "rejected") {
    return { bgcolor: "#ffebee", color: "#c62828" };
  }

  return { bgcolor: "#e3f2fd", color: "#1565c0" };
};

export const SellerBrandsManagementPage = () => {
  const [items, setItems] = useState<SellerBrandItem[]>([]);
  const [form, setForm] = useState<BrandFormState>(initialFormState);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<SellerBrandItem | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const loadBrands = async () => {
    setLoading(true);

    try {
      const data = await sellerPortalService.getMyBrands();
      setItems(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load brands";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBrands();
  }, []);

  const setField = (field: keyof BrandFormState, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
  };

  const handleLogoSelect = (file: File | null) => {
    if (logoPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    if (!file) {
      setLogoFile(null);
      setLogoPreviewUrl("");
      return;
    }

    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.brandName.trim()) {
      toast.error("Brand Name is required.");
      return;
    }

    setIsSaving(true);

    try {
      const uploadedLogo = logoFile ? (await productService.uploadImages([logoFile]))[0] : undefined;

      if (editingBrandId) {
        await sellerPortalService.updateMyBrand(editingBrandId, {
          brandName: form.brandName.trim(),
          logo: uploadedLogo !== undefined ? uploadedLogo : logoPreviewUrl,
          companyName: form.companyName.trim(),
          email: form.contactEmail.trim().toLowerCase(),
          phone: form.phoneNumber.trim(),
          websiteUrl: form.websiteUrl.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
        });
        toast.success("Brand updated and sent for review.");
      } else {
        await sellerPortalService.createBrand({
          brandName: form.brandName.trim(),
          logo: uploadedLogo,
          companyName: form.companyName.trim(),
          email: form.contactEmail.trim().toLowerCase(),
          phone: form.phoneNumber.trim(),
          websiteUrl: form.websiteUrl.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
        });
        toast.success("Brand submitted for approval.");
      }

      setForm(initialFormState);
      setEditingBrandId(null);
      handleLogoSelect(null);
      await loadBrands();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit brand";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = async (id: string) => {
    try {
      const item = await sellerPortalService.getMyBrandById(id);
      setEditingBrandId(item._id);
      setForm({
        brandName: item.brandName || "",
        companyName: item.companyName || item.contactInfo?.companyName || "",
        contactEmail: item.email || item.contactInfo?.email || "",
        phoneNumber: item.phone || item.contactInfo?.phone || "",
        websiteUrl: item.websiteUrl || item.contactInfo?.websiteUrl || "",
        description: item.description || "",
        address: item.address || item.contactInfo?.address || "",
      });
      handleLogoSelect(null);
      setLogoPreviewUrl(item.logo || "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load brand for editing";
      toast.error(message);
    }
  };

  const openDetails = async (id: string) => {
    try {
      const item = await sellerPortalService.getMyBrandById(id);
      setSelectedBrand(item);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load brand details";
      toast.error(message);
    }
  };

  const deleteBrand = async (id: string) => {
    setIsDeleting(true);

    try {
      await sellerPortalService.deleteMyBrand(id);
      toast.success("Brand deleted.");

      if (editingBrandId === id) {
        setEditingBrandId(null);
        setForm(initialFormState);
        handleLogoSelect(null);
      }

      setSelectedBrand(null);
      await loadBrands();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete brand";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">Brand Management</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Seller / Brands</Typography>
      </Stack>

      <Paper sx={{ p: 2.3, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">{editingBrandId ? "Edit Brand" : "Add New Brand"}</Typography>
        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 2 }}>
          {editingBrandId ? "Updated brands are set back to Pending and require admin review again." : "New submissions are created with Pending status and require admin approval."}
        </Typography>

        <Grid container spacing={1.8}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Brand Name" value={form.brandName} onChange={event => setField("brandName", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Company Name" value={form.companyName} onChange={event => setField("companyName", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Contact Email" value={form.contactEmail} onChange={event => setField("contactEmail", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Phone Number" value={form.phoneNumber} onChange={event => setField("phoneNumber", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Website URL" value={form.websiteUrl} onChange={event => setField("websiteUrl", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Status" value="Pending" slotProps={{ input: { readOnly: true } }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth multiline rows={3} label="Brand Description" value={form.description} onChange={event => setField("description", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth multiline rows={2} label="Address" value={form.address} onChange={event => setField("address", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 1 }}>Brand Logo</Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={event => {
                const file = event.target.files?.[0] ?? null;
                handleLogoSelect(file);
                event.target.value = "";
              }}
            />
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "1px dashed #d3d7e3",
                borderRadius: 2,
                minHeight: 100,
                display: "grid",
                placeItems: "center",
                bgcolor: "#fcfcfd",
                cursor: "pointer",
              }}
            >
              <Stack spacing={1} alignItems="center">
                <CloudUploadRoundedIcon sx={{ fontSize: 30, color: "#7b8197" }} />
                <Typography color="var(--skote-subtle)">Click to upload brand logo</Typography>
                <Typography variant="caption" color="var(--skote-subtle)">{logoFile ? logoFile.name : "No image selected"}</Typography>
              </Stack>
            </Box>
            {logoPreviewUrl ? (
              <Stack direction="row" spacing={1.2} alignItems="center" mt={1.2}>
                <img src={logoPreviewUrl} alt="Brand logo preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteRoundedIcon />}
                  onClick={() => {
                    handleLogoSelect(null);
                  }}
                >
                  Remove
                </Button>
              </Stack>
            ) : null}
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Stack direction="row" spacing={1}>
            {editingBrandId ? (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingBrandId(null);
                  setForm(initialFormState);
                  handleLogoSelect(null);
                }}
              >
                Cancel
              </Button>
            ) : null}
            <Button variant="contained" onClick={() => void handleSubmit()} disabled={isSaving}>
              {isSaving ? "Saving..." : editingBrandId ? "Save Changes" : "Submit Brand"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">My Brands</Typography>
        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 1.5 }}>
          Track approval status for your submitted brands.
        </Typography>
        {loading ? <Alert severity="info">Loading brands...</Alert> : null}
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
              <TableCell sx={{ fontWeight: 700 }}>Logo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Brand Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "var(--skote-subtle)", py: 2 }}>
                  No brands submitted yet.
                </TableCell>
              </TableRow>
            ) : items.map(item => (
              <TableRow key={item._id} hover>
                <TableCell>
                  {item.logo ? (
                    <img src={item.logo} alt={item.brandName} style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover" }} />
                  ) : (
                    <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: "#eef0f7" }} />
                  )}
                </TableCell>
                <TableCell>{item.brandName}</TableCell>
                <TableCell>{item.companyName || item.contactInfo?.companyName || "-"}</TableCell>
                <TableCell>{item.email || item.contactInfo?.email || "-"}</TableCell>
                <TableCell>
                  <Chip size="small" label={item.status} sx={{ textTransform: "capitalize", ...getStatusChipStyles(item.status) }} />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View">
                      <span>
                        <IconButton size="small" onClick={() => void openDetails(item._id)}>
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <span>
                        <IconButton size="small" onClick={() => void startEdit(item._id)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={isDeleting}
                          onClick={() => {
                            const shouldDelete = window.confirm("Are you sure you want to delete this brand?");

                            if (shouldDelete) {
                              void deleteBrand(item._id);
                            }
                          }}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(selectedBrand)} onClose={() => setSelectedBrand(null)} fullWidth maxWidth="sm">
        <DialogTitle>Brand Details</DialogTitle>
        <DialogContent>
          {selectedBrand ? (
            <Stack spacing={1.2} mt={0.5}>
              <Typography><strong>Brand Name:</strong> {selectedBrand.brandName}</Typography>
              <Typography><strong>Company Name:</strong> {selectedBrand.companyName || selectedBrand.contactInfo?.companyName || "-"}</Typography>
              <Typography><strong>Contact Email:</strong> {selectedBrand.email || selectedBrand.contactInfo?.email || "-"}</Typography>
              <Typography><strong>Phone:</strong> {selectedBrand.phone || selectedBrand.contactInfo?.phone || "-"}</Typography>
              <Typography><strong>Website:</strong> {selectedBrand.websiteUrl || selectedBrand.contactInfo?.websiteUrl || "-"}</Typography>
              <Typography><strong>Address:</strong> {selectedBrand.address || selectedBrand.contactInfo?.address || "-"}</Typography>
              <Typography><strong>Description:</strong> {selectedBrand.description || "-"}</Typography>
              <Typography>
                <strong>Status:</strong>{" "}
                <Chip size="small" label={selectedBrand.status} sx={{ textTransform: "capitalize", ...getStatusChipStyles(selectedBrand.status) }} />
              </Typography>
              {selectedBrand.logo ? <img src={selectedBrand.logo} alt={selectedBrand.brandName} style={{ width: 84, height: 84, borderRadius: 8, objectFit: "cover" }} /> : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBrand(null)}>Close</Button>
          {selectedBrand ? <Button color="error" onClick={() => void deleteBrand(selectedBrand._id)} disabled={isDeleting}>Delete</Button> : null}
        </DialogActions>
      </Dialog>
    </Stack>
  );
};


