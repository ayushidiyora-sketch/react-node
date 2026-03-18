import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { sellerPortalService } from "../../services/sellerPortalService";

export const Sellermyproductpage = () => {
  const [myProducts, setMyProducts] = useState<ReturnType<typeof sellerPortalService.getMyProducts> extends Promise<infer T> ? T : never>([]);
  const [productSearch, setProductSearch] = useState("");

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { admin } = useAuth();


  const filteredProducts = useMemo(
    () =>
      myProducts.filter(product => {
        const categoryName = typeof product.category === "string" ? product.category : product.category?.name;
        const haystack = `${product.name} ${categoryName ?? ""}`.toLowerCase();
        return haystack.includes(productSearch.toLowerCase());
      }),
    [myProducts, productSearch],
  );
    const loadDashboard = async () => {
      try {
        const products = await sellerPortalService.getMyProducts();
        setMyProducts(products);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load products";
        toast.error(message);
      }
    };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const openEdit = (product: (typeof myProducts)[number]) => {
    navigate(`/seller/products/edit/${product._id}`, { state: { product } });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await sellerPortalService.deleteProduct(deleteId);
      toast.success("Product deleted");
      setDeleteId(null);
      void loadDashboard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
 <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">My Products</Typography>
          <Typography variant="caption" color="var(--skote-subtle)">Logged in seller: {admin?.name || "Seller"}</Typography>
        </Stack>

        <TextField
          size="small"
          placeholder="Search my products..."
          value={productSearch}
          onChange={event => setProductSearch(event.target.value)}
          sx={{ mb: 2, minWidth: { xs: 220, md: 420 } }}
        />

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8f9fb" }}>
              <TableCell sx={{ fontWeight: 700, width: 60 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Sale Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Rating</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: "var(--skote-subtle)", py: 2 }}>
                  No products added yet.
                </TableCell>
              </TableRow>
            ) : filteredProducts.map(product => (
              <TableRow key={product._id}>
                <TableCell>
                  {product.featureImage ? (
                    <img src={product.featureImage} alt={product.name} style={{ width: 50, height: 50, borderRadius: 4, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 50, height: 50, borderRadius: 4, background: "#f0f0f0" }} />
                  )}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                <TableCell>{typeof product.category === "string" ? product.category : product.category?.name}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={product.status || "pending"}
                    sx={{
                      textTransform: "capitalize",
                      bgcolor: product.status === "approved" ? "#e8f5e9" : product.status === "rejected" ? "#ffebee" : "#e3f2fd",
                      color: product.status === "approved" ? "#2e7d32" : product.status === "rejected" ? "#c62828" : "#1565c0",
                    }}
                  />
                </TableCell>
                <TableCell align="right">₹{Number(product.price || 0).toLocaleString()}</TableCell>
                <TableCell align="right">₹{product.salePrice ? Number(product.salePrice).toLocaleString() : "-"}</TableCell>
                <TableCell align="center">{product.rating ?? "-"}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton size="small" color="primary" onClick={() => openEdit(product)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteId(product._id)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this product? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};