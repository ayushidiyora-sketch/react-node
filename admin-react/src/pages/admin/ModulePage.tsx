import { AddRounded, DeleteRounded, EditRounded } from "@mui/icons-material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Pagination, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate, useParams } from "react-router-dom";

import { adminService } from "../../services/adminService.ts";
import { productService } from "../../services/productService.ts";
import { getModuleConfig } from "../../utils/moduleConfig.ts";

type ResourceItem = {
  id: string;
  status: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

const formatMaybeDate = (value: unknown) => {
  if (typeof value !== "string" || !value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ModulePage = () => {
  const navigate = useNavigate();
  const { moduleKey = "" } = useParams();
  const config = getModuleConfig(moduleKey);
  const [rows, setRows] = useState<ResourceItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [imageFieldUrls, setImageFieldUrls] = useState<Record<string, string[]>>({});
  const [imageFieldFiles, setImageFieldFiles] = useState<Record<string, File[]>>({});
  const isReadOnlyModule = moduleKey === "payments";

  useEffect(() => {
    if (!config) {
      navigate("/admin");
      return;
    }

    const loadRows = async () => {
      const response = moduleKey === "payments"
        ? await adminService.listPaymentTransactions()
        : await adminService.listResources(moduleKey);
      setRows(response.items);
    };

    void loadRows();
  }, [config, moduleKey, navigate]);

  const filteredRows = useMemo(() => {
    return rows.filter(item => {
      const matchesSearch = JSON.stringify(item.data).toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" ? true : item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const pageSize = 10;
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  if (!config) {
    return null;
  }

  const openCreate = () => {
    const defaults: Record<string, string> = {};
    config.fields.forEach(field => {
      defaults[field.key] = "";
    });
    defaults.status = config.defaultStatus;
    setFormState(defaults);
    setImageFieldUrls({});
    setImageFieldFiles({});
    setEditingItem(null);
    setOpenDialog(true);
  };

  const openEdit = (item: ResourceItem) => {
    const defaults: Record<string, string> = {};
    const existingImageValues: Record<string, string[]> = {};
    config.fields.forEach(field => {
      if (field.type === "image-single") {
        const value = item.data[field.key];
        const url = typeof value === "string" ? value : "";
        defaults[field.key] = url;
        existingImageValues[field.key] = url ? [url] : [];
        return;
      }

      if (field.type === "image-multi") {
        const value = item.data[field.key];
        if (Array.isArray(value)) {
          existingImageValues[field.key] = value.filter(url => typeof url === "string") as string[];
        } else if (typeof value === "string" && value.trim()) {
          existingImageValues[field.key] = value.split(",").map(part => part.trim()).filter(Boolean);
        } else {
          existingImageValues[field.key] = [];
        }
        defaults[field.key] = "";
        return;
      }

      defaults[field.key] = String(item.data[field.key] ?? "");
    });
    defaults.status = item.status;
    setFormState(defaults);
    setImageFieldUrls(existingImageValues);
    setImageFieldFiles({});
    setEditingItem(item);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    const payloadData: Record<string, unknown> = {};

    for (const field of config.fields) {
      const rawValue = formState[field.key] ?? "";

      if (field.type === "number") {
        payloadData[field.key] = Number(rawValue || 0);
        continue;
      }

      if (field.type === "image-single" || field.type === "image-multi") {
        const existingUrls = imageFieldUrls[field.key] ?? [];
        const newFiles = imageFieldFiles[field.key] ?? [];
        const uploadedUrls = newFiles.length ? await productService.uploadImages(newFiles) : [];
        const combinedUrls = [...existingUrls, ...uploadedUrls];
        payloadData[field.key] = field.type === "image-single" ? combinedUrls[0] ?? "" : combinedUrls;
        continue;
      }

      payloadData[field.key] = rawValue;
    }

    const payload = {
      data: payloadData,
      status: formState.status || config.defaultStatus,
    };

    if (editingItem) {
      const response = await adminService.updateResource(moduleKey, editingItem.id, payload);
      setRows(response.items);
      toast.success("Updated successfully.");
    } else {
      const response = await adminService.createResource(moduleKey, payload);
      setRows(response.items);
      toast.success("Created successfully.");
    }

    setOpenDialog(false);
  };

  const handleDelete = async (id: string) => {
    const response = await adminService.deleteResource(moduleKey, id);
    setRows(response.items);
    toast.success("Deleted successfully.");
  };

  const handleStatusChange = async (id: string, nextStatus: string) => {
    const response = await adminService.updateResourceStatus(moduleKey, id, nextStatus);
    setRows(response.items);
    toast.success("Status updated.");
  };

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={700}>{config.label}</Typography>
            {/* <Typography variant="body2" color="text.secondary">Dynamic CRUD with search, filter, pagination and status updates.</Typography> */}
          </Box>
          <Stack direction="row" spacing={1}>
            {moduleKey === "products" ? (
              <Button variant="outlined" onClick={() => navigate("/admin/products/add")}>Add Product Page</Button>
            ) : null}
            {!isReadOnlyModule ? (
              <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>Add New</Button>
            ) : null}
          </Stack>
        </Stack>

        {moduleKey === "orders" ? (
          <Alert sx={{ mt: 2 }} severity="info">
            Use the orders detail pages for complete status and payment review. Open a row and click details.
          </Alert>
        ) : null}
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
          <TextField label="Search" value={search} onChange={event => setSearch(event.target.value)} fullWidth />
          <TextField select label="Status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="All">All</MenuItem>
            {config.statuses.map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                {config.fields.map(field => <TableCell key={field.key}>{field.label}</TableCell>)}
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedRows.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>{String(item.id).slice(0, 8)}</TableCell>
                  {config.fields.map(field => (
                    <TableCell key={field.key}>
                      {field.type === "image-single" ? (
                        typeof item.data[field.key] === "string" && item.data[field.key] ? (
                          <img src={String(item.data[field.key])} alt={field.label} style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover" }} />
                        ) : "-"
                      ) : field.type === "image-multi" ? (
                        Array.isArray(item.data[field.key]) && (item.data[field.key] as string[]).length ? (
                          <Stack direction="row" spacing={0.5}>
                            {(item.data[field.key] as string[]).slice(0, 3).map((url, index) => (
                              <img key={`${url}-${index}`} src={url} alt={`${field.label}-${index}`} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                            ))}
                          </Stack>
                        ) : "-"
                      ) : field.key === "paidAt" ? (
                        formatMaybeDate(item.data[field.key])
                      ) : field.key === "amount" ? (
                        `₹${Number(item.data[field.key] ?? 0).toLocaleString()}`
                      ) : Array.isArray(item.data[field.key]) ? (
                        (item.data[field.key] as string[]).join(", ")
                      ) : String(item.data[field.key] ?? "-")}
                    </TableCell>
                  ))}
                  <TableCell>
                    {isReadOnlyModule ? (
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: item.status === "Successful" ? "#34c38f1f" : item.status === "Failed" ? "#f46a6a1f" : "#556ee61f",
                          color: item.status === "Successful" ? "#34c38f" : item.status === "Failed" ? "#f46a6a" : "#556ee6",
                        }}
                      />
                    ) : (
                      <TextField
                        select
                        size="small"
                        value={item.status}
                        onChange={event => void handleStatusChange(item.id, event.target.value)}
                        sx={{ minWidth: 140 }}
                      >
                        {config.statuses.map(status => (
                          <MenuItem value={status} key={status}>{status}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {moduleKey === "orders" ? (
                        <Button component={Link} to={`/admin/orders/${item.id}`} size="small" variant="outlined">Details</Button>
                      ) : null}
                      {!isReadOnlyModule ? (
                        <Chip icon={<EditRounded />} label="Edit" onClick={() => openEdit(item)} />
                      ) : null}
                      {!isReadOnlyModule ? (
                        <Chip icon={<DeleteRounded />} label="Delete" color="error" onClick={() => void handleDelete(item.id)} />
                      ) : null}
                      {isReadOnlyModule ? <Typography variant="body2" color="text.secondary">-</Typography> : null}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Pagination count={totalPages} page={page} onChange={(_event, value) => setPage(value)} color="primary" />
        </Stack>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? "Edit Item" : "Create Item"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {config.fields.map(field => {
              if (field.type === "image-single" || field.type === "image-multi") {
                const inputId = `upload-${field.key}`;
                const existingUrls = imageFieldUrls[field.key] ?? [];
                const selectedFiles = imageFieldFiles[field.key] ?? [];

                return (
                  <Stack key={field.key} spacing={1}>
                    <Typography variant="body2" sx={{ color: "var(--skote-subtle)" }}>{field.label}</Typography>
                    <input
                      id={inputId}
                      type="file"
                      accept="image/*"
                      multiple={field.type === "image-multi"}
                      style={{ display: "none" }}
                      onChange={event => {
                        const files = Array.from(event.target.files || []);
                        setImageFieldFiles(previous => ({
                          ...previous,
                          [field.key]: field.type === "image-single" ? files.slice(0, 1) : [...(previous[field.key] ?? []), ...files],
                        }));
                        event.target.value = "";
                      }}
                    />
                    <Box
                      onClick={() => document.getElementById(inputId)?.click()}
                      sx={{
                        border: "1px dashed #d3d7e3",
                        borderRadius: 2,
                        minHeight: 110,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "#fcfcfd",
                        cursor: "pointer",
                      }}
                    >
                      <Stack spacing={1} alignItems="center">
                        <CloudUploadRoundedIcon sx={{ fontSize: 32, color: "#7b8197" }} />
                        <Typography color="var(--skote-subtle)">Click to upload image.</Typography>
                      </Stack>
                    </Box>

                    {existingUrls.length ? (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {existingUrls.map((url, index) => (
                          <Stack key={`${url}-${index}`} spacing={0.5} sx={{ width: 96, px: 1, py: 0.8, borderRadius: 1.5, bgcolor: "#eef2ff" }}>
                            <img src={url} alt={`existing-${index}`} style={{ width: "100%", height: 56, borderRadius: 6, objectFit: "cover" }} />
                            <Box component="span" onClick={() => setImageFieldUrls(previous => ({ ...previous, [field.key]: existingUrls.filter((_, i) => i !== index) }))}
                              sx={{ cursor: "pointer", color: "#c62828", fontWeight: 700, fontSize: 12, lineHeight: 1, textAlign: "right", "&:hover": { opacity: 0.7 } }}>Remove</Box>
                          </Stack>
                        ))}
                      </Stack>
                    ) : null}

                    {selectedFiles.length ? (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {selectedFiles.map((file, index) => (
                          <Stack key={`${file.name}-${index}`} spacing={0.5} sx={{ width: 96, px: 1, py: 0.8, borderRadius: 1.5, bgcolor: "#eef2ff" }}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              style={{ width: "100%", height: 56, borderRadius: 6, objectFit: "cover" }}
                              onLoad={event => URL.revokeObjectURL((event.target as HTMLImageElement).src)}
                            />
                            <Box component="span" onClick={() => setImageFieldFiles(previous => ({ ...previous, [field.key]: selectedFiles.filter((_, i) => i !== index) }))}
                              sx={{ cursor: "pointer", color: "#c62828", fontWeight: 700, fontSize: 12, lineHeight: 1, textAlign: "right", "&:hover": { opacity: 0.7 } }}>Remove</Box>
                          </Stack>
                        ))}
                      </Stack>
                    ) : null}
                  </Stack>
                );
              }

              return (
                <TextField
                  key={field.key}
                  label={field.label}
                  value={formState[field.key] ?? ""}
                  multiline={field.type === "textarea"}
                  rows={field.type === "textarea" ? 3 : undefined}
                  type={field.type === "number" ? "number" : "text"}
                  onChange={event => setFormState(previous => ({ ...previous, [field.key]: event.target.value }))}
                  fullWidth
                />
              );
            })}
            <TextField select label="Status" value={formState.status ?? config.defaultStatus} onChange={event => setFormState(previous => ({ ...previous, status: event.target.value }))}>
              {config.statuses.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSubmit()}>{editingItem ? "Save" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};