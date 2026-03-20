import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import {
  Avatar,
  Button,
  Chip,
  Grid,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Pagination,
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

import { productService } from "../../services/productService.ts";
import { sellerPortalService } from "../../services/sellerPortalService.ts";

type SellerBrand = Awaited<ReturnType<typeof sellerPortalService.getAdminBrands>>[number];

const getStatusChipStyles = (status: SellerBrand["status"]) => {
  if (status === "approved") {
    return { bgcolor: "#e8f5e9", color: "#2e7d32" };
  }

  if (status === "rejected") {
    return { bgcolor: "#ffebee", color: "#c62828" };
  }

  return { bgcolor: "#e3f2fd", color: "#1565c0" };
};

export const SellerBrandsPage = () => {
  const pageSize = 10;
  const [items, setItems] = useState<SellerBrand[]>([]);
  const [page, setPage] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState<SellerBrand | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [form, setForm] = useState({ brandName: "", description: "" });
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const loadItems = async () => {
    try {
      const data = await sellerPortalService.getAdminBrands();
      setItems(data);
    } catch (loadError) {
      const loadMessage = loadError instanceof Error ? loadError.message : "Unable to fetch brands";
      toast.error(loadMessage);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [items.length, page]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageRows = items.slice((page - 1) * pageSize, page * pageSize);
  const startRow = items.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = items.length === 0 ? 0 : Math.min(page * pageSize, items.length);

  const resetForm = () => {
    setEditingBrandId(null);
    setForm({ brandName: "", description: "" });
    setLogoFile(null);
    setLogoPreviewUrl("");
  };

  const handleLogoSelect = (file: File | null) => {
    if (!file) {
      setLogoFile(null);
      setLogoPreviewUrl("");
      return;
    }

    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const startEdit = async (id: string) => {
    try {
      const item = await sellerPortalService.getAdminBrandById(id);
      setEditingBrandId(item._id);
      setForm({ brandName: item.brandName || "", description: item.description || "" });
      setLogoFile(null);
      setLogoPreviewUrl(item.logo || "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load brand for edit";
      toast.error(message);
    }
  };

  const saveBrand = async () => {
    const normalizedBrandName = form.brandName.trim();

    if (!normalizedBrandName) {
      toast.error("Brand Name is required.");
      return;
    }

    setIsSaving(true);

    try {
      const uploadedLogo = logoFile ? (await productService.uploadImages([logoFile]))[0] : undefined;

      if (editingBrandId) {
        await sellerPortalService.updateAdminBrand(editingBrandId, {
          brandName: normalizedBrandName,
          description: form.description.trim(),
          logo: uploadedLogo !== undefined ? uploadedLogo : logoPreviewUrl,
        });
        toast.success("Brand updated.");
      } else {
        await sellerPortalService.createAdminBrand({
          brandName: normalizedBrandName,
          description: form.description.trim(),
          logo: uploadedLogo,
        });
        toast.success("Brand created.");
      }

      resetForm();
      await loadItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save brand";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const openBrandDetails = async (id: string) => {
    setIsLoadingDetails(true);

    try {
      const item = await sellerPortalService.getAdminBrandById(id);
      setSelectedBrand(item);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch brand details";
      toast.error(message);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const updateStatus = async (status: "approved" | "rejected") => {
    if (!selectedBrand) {
      return;
    }

    setIsUpdating(true);

    try {
      await sellerPortalService.updateAdminBrandStatus(selectedBrand._id, status);
      toast.success(`Brand ${status}.`);
      setSelectedBrand(null);
      await loadItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update brand status";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBrandById = async (id: string) => {
    setIsDeleting(true);

    try {
      await sellerPortalService.deleteAdminBrand(id);
      toast.success("Brand deleted.");

      if (selectedBrand?._id === id) {
        setSelectedBrand(null);
      }

      await loadItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete brand";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteBrand = async () => {
    if (!selectedBrand) {
      return;
    }

    await deleteBrandById(selectedBrand._id);
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">SELLER BRANDS / SHOPS</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Brands</Typography>
      </Stack>

      <Paper sx={{ p: 2.3, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">{editingBrandId ? "Edit Brand" : "Add Brand"}</Typography>
        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 2 }}>Fill brand image, name and description.</Typography>

        <Grid container spacing={1.8}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Brand Name"
              value={form.brandName}
              onChange={event => setForm(previous => ({ ...previous, brandName: event.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Brand Description"
              value={form.description}
              onChange={event => setForm(previous => ({ ...previous, description: event.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 1 }}>Brand Image</Typography>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={event => {
                const file = event.target.files?.[0] ?? null;
                handleLogoSelect(file);
                event.target.value = "";
              }}
            />
            <Paper
              variant="outlined"
              onClick={() => logoInputRef.current?.click()}
              sx={{
                p: 2,
                borderStyle: "dashed",
                cursor: "pointer",
                bgcolor: "#fcfcfd",
              }}
            >
              <Stack spacing={1} alignItems="center">
                <CloudUploadRoundedIcon sx={{ fontSize: 30, color: "#7b8197" }} />
                <Typography color="var(--skote-subtle)">Click to upload brand image</Typography>
                <Typography variant="caption" color="var(--skote-subtle)">{logoFile ? logoFile.name : "No image selected"}</Typography>
              </Stack>
            </Paper>
            {logoPreviewUrl ? (
              <Stack direction="row" spacing={1.2} alignItems="center" mt={1.2}>
                <img src={logoPreviewUrl} alt="Brand preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                <IconButton size="small" sx={{ border: "1px solid", borderColor: "error.main" }} onClick={() => handleLogoSelect(null)}><CloseRoundedIcon fontSize="small" color="error" /></IconButton>
              </Stack>
            ) : null}
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Stack direction="row" spacing={1}>
            {editingBrandId ? <Button variant="outlined" onClick={resetForm}>Cancel</Button> : null}
            <Button variant="contained" onClick={() => void saveBrand()} disabled={isSaving}>
              {isSaving ? "Saving..." : editingBrandId ? "Save Changes" : "Add Brand"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
              <TableCell sx={{ fontWeight: 700 }}>Logo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Brand Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Seller Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Company Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: "var(--skote-subtle)", py: 2 }}>
                  No brands submitted yet.
                </TableCell>
              </TableRow>
            ) : pageRows.map(item => (
              <TableRow key={item._id} hover>
                <TableCell>
                  {item.logo ? <Avatar src={item.logo} alt={item.brandName} variant="rounded" sx={{ width: 34, height: 34 }} /> : <Avatar variant="rounded" sx={{ width: 34, height: 34 }}>{item.brandName[0]?.toUpperCase() ?? "B"}</Avatar>}
                </TableCell>
                <TableCell>{item.brandName}</TableCell>
                <TableCell>{item.sellerName}</TableCell>
                <TableCell>{item.companyName || item.contactInfo?.companyName || "-"}</TableCell>
                <TableCell>{item.email || item.contactInfo?.email || "-"}</TableCell>
                <TableCell>{item.phone || item.contactInfo?.phone || "-"}</TableCell>
                <TableCell>
                  <Chip size="small" label={item.status} sx={{ textTransform: "capitalize", ...getStatusChipStyles(item.status) }} />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View">
                      <span>
                        <IconButton size="small" onClick={() => void openBrandDetails(item._id)} disabled={isLoadingDetails}>
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <span>
                        <IconButton size="small" color="primary" onClick={() => void startEdit(item._id)} disabled={isSaving || isLoadingDetails}>
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
                              void deleteBrandById(item._id);
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

        {items.length > 0 ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2.2}>
            <Typography variant="body2" sx={{ color: "var(--skote-subtle)" }}>
              Showing {startRow}-{endRow} of {items.length} Results
            </Typography>
            <Pagination
              page={page}
              count={totalPages}
              onChange={(_event, value) => setPage(value)}
              shape="rounded"
              color="primary"
              size="small"
            />
          </Stack>
        ) : null}
      </Paper>

      <Dialog open={Boolean(selectedBrand)} onClose={() => setSelectedBrand(null)} fullWidth maxWidth="sm">
        <DialogTitle>Brand Details</DialogTitle>
        <DialogContent>
          {selectedBrand ? (
            <Stack spacing={1.2} mt={0.5}>
              <Typography><strong>Brand Name:</strong> {selectedBrand.brandName}</Typography>
              <Typography><strong>Seller:</strong> {selectedBrand.sellerName}</Typography>
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
              {selectedBrand.logo ? <Avatar src={selectedBrand.logo} alt={selectedBrand.brandName} variant="rounded" sx={{ width: 72, height: 72 }} /> : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBrand(null)}>Close</Button>
          <Button
            variant="outlined"
            color="error"
            disabled={isUpdating || isDeleting}
            onClick={() => void deleteBrand()}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={isUpdating || isDeleting || selectedBrand?.status === "rejected"}
            onClick={() => void updateStatus("rejected")}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            disabled={isUpdating || isDeleting || selectedBrand?.status === "approved"}
            onClick={() => void updateStatus("approved")}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
