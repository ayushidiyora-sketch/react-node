import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { categoryService } from "../../services/categoryService.ts";

type Category = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const pageSize = 10;

export const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    try {
      const items = await categoryService.list();
      setCategories(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch categories";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const filtered = useMemo(
    () =>
      categories.filter(item => {
        const haystack = `${item.name} ${item.description}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [categories, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const startRow = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = filtered.length === 0 ? 0 : Math.min(page * pageSize, filtered.length);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditingItem(null);
    setFormName("");
    setFormDescription("");
    setOpenDialog(true);
  };

  const openEdit = (item: Category) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingItem) {
        const updated = await categoryService.update(editingItem._id, {
          name: formName,
          description: formDescription,
        });

        setCategories(previous => previous.map(item => (item._id === updated._id ? updated : item)));
        toast.success("Category updated");
      } else {
        const created = await categoryService.create({
          name: formName,
          description: formDescription,
        });

        setCategories(previous => [created, ...previous]);
        toast.success("Category added");
      }

      setOpenDialog(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save category";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryService.remove(id);
      setCategories(previous => previous.filter(item => item._id !== id));
      toast.success("Category deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete category";
      toast.error(message);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">CATEGORY</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Category</Typography>
      </Stack>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" mb={2}>
          <TextField
            size="small"
            placeholder="Search category..."
            value={search}
            onChange={event => setSearch(event.target.value)}
            sx={{ minWidth: { xs: 220, md: 420 } }}
          />
          <Button variant="contained" onClick={openCreate}>+ Add Category</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
              <TableCell sx={{ fontWeight: 700 }}>Category Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map(item => (
              <TableRow key={item._id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                <TableCell>{item.description || "-"}</TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <Stack direction="row" spacing={1.2} justifyContent="flex-end">
                    <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: "#34c38f" }}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => void handleDelete(item._id)} sx={{ color: "#f46a6a" }}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length > 0 ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2.2}>
            <Typography variant="body2" color="var(--skote-subtle)">
              Showing {startRow}-{endRow} of {filtered.length} Results
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

        {loading ? (
          <Box py={2}>
            <Typography color="var(--skote-subtle)">Loading categories...</Typography>
          </Box>
        ) : null}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Category Name"
              value={formName}
              onChange={event => setFormName(event.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={formDescription}
              onChange={event => setFormDescription(event.target.value)}
              multiline
              rows={4}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSubmit()}>{editingItem ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
