import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import {
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { productService, type ProductItem } from "../../services/productService.ts";
import { wishlistService } from "../../services/wishlistService.ts";

export const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const getStatusChipStyles = (status: "pending" | "approved" | "rejected") => {
    if (status === "approved") {
      return { bgcolor: "#e8f5e9", color: "#2e7d32" };
    }

    if (status === "rejected") {
      return { bgcolor: "#ffebee", color: "#c62828" };
    }

    return { bgcolor: "#e3f2fd", color: "#1565c0" };
  };

  const loadData = async () => {
    try {
      const productItems = await productService.list();
      setProducts(productItems);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch products";
      toast.error(message);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter(item => {
        const itemStatus = item.status || "approved";
        const statusMatches = statusFilter === "all" ? true : itemStatus === statusFilter;
        if (!statusMatches) {
          return false;
        }

        const categoryName = typeof item.category === "string" ? item.category : item.category?.name;
        const haystack = `${item.name} ${categoryName ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [products, search, statusFilter],
  );

  const handleDelete = async (id: string) => {
    try {
      await productService.remove(id);
      setProducts(previous => previous.filter(item => item._id !== id));
      toast.success("Product deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete product";
      toast.error(message);
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    try {
      await wishlistService.add(productId);
      toast.success("Product added to wishlist");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add product to wishlist";
      toast.error(message);
    }
  };

  const handleStatusChange = async (id: string, status: "pending" | "approved" | "rejected") => {
    try {
      const updated = await productService.updateStatus(id, status);
      setProducts(previous => previous.map(item => (item._id === id ? updated : item)));
      toast.success("Product status updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update product status";
      toast.error(message);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">PRODUCTS</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Product</Typography>
      </Stack>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" mb={2}>
          <TextField
            size="small"
            placeholder="Search product..."
            value={search}
            onChange={event => setSearch(event.target.value)}
            sx={{ minWidth: { xs: 220, md: 420 } }}
          />
          <Button variant="contained" onClick={() => navigate("/admin/products/add")}>+ Add Product</Button>
        </Stack>

        <Tabs
          value={statusFilter}
          onChange={(_event, value) => setStatusFilter(value)}
          sx={{ mb: 2, borderBottom: "1px solid #eef0f7" }}
        >
          <Tab value="all" label="All" />
          <Tab value="pending" label="Pending" />
          <Tab value="approved" label="Approved" />
          <Tab value="rejected" label="Rejected" />
        </Tabs>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
              <TableCell sx={{ fontWeight: 700, width: 60 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Seller</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Sale Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Rating</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map(item => (
              <TableRow key={item._id} hover>
                <TableCell>
                  {item.featureImage ? (
                    <img src={item.featureImage} alt={item.name} style={{ width: 50, height: 50, borderRadius: 4, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 50, height: 50, borderRadius: 4, background: "#f0f0f0" }} />
                  )}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                <TableCell>{typeof item.category === "string" ? item.category : item.category?.name}</TableCell>
                <TableCell>
                  {item.submittedByRole === "seller" ? (
                    <Chip size="small" label={item.sellerName || "Seller"} sx={{ bgcolor: "#e3f2fd", color: "#1565c0" }} />
                  ) : (
                    <Chip size="small" label="Admin" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32" }} />
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={(item.status || "approved")}
                      sx={{ textTransform: "capitalize", ...getStatusChipStyles(item.status || "approved") }}
                    />
                    <TextField
                      select
                      size="small"
                      value={item.status || "approved"}
                      onChange={event => void handleStatusChange(item._id, event.target.value as "pending" | "approved" | "rejected")}
                      sx={{ minWidth: 128 }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </TextField>
                  </Stack>
                </TableCell>
                <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                <TableCell align="right">{item.salePrice ? `₹${item.salePrice.toFixed(2)}` : "-"}</TableCell>
                <TableCell align="center">{item.rating || "-"}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <Stack direction="row" spacing={1.2} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => void handleAddToWishlist(item._id)}
                      sx={{ color: "#556ee6" }}
                    >
                      <FavoriteBorderRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/products/${item._id}/edit`)}
                      sx={{ color: "#34c38f" }}
                    >
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

        {filteredProducts.length === 0 && (
          <Typography sx={{ mt: 2, color: "var(--skote-subtle)", textAlign: "center" }}>
            No products found
          </Typography>
        )}
      </Paper>
    </Stack>
  );
};
