import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { IconButton, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { wishlistService, type WishlistProduct } from "../../services/wishlistService.ts";

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString();
};

const pageSize = 10;

export const WishlistProductsPage = () => {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [page, setPage] = useState(1);

  const loadWishlist = async () => {
    try {
      const data = await wishlistService.list();
      setItems(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load wishlist products";
      toast.error(message);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWishlist();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageRows = items.slice((page - 1) * pageSize, page * pageSize);
  const startRow = items.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = items.length === 0 ? 0 : Math.min(page * pageSize, items.length);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleRemove = async (id: string) => {
    try {
      await wishlistService.remove(id);
      setItems(previous => previous.filter(item => item._id !== id));
      toast.success("Removed from wishlist");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove wishlist item";
      toast.error(message);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">WISHLIST PRODUCTS</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Wishlist</Typography>
      </Stack>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
              <TableCell sx={{ fontWeight: 700, width: 70 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Added On</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map(item => {
              const product = item.product;
              const categoryName = product
                ? (typeof product.category === "string" ? product.category : product.category?.name)
                : "-";
              const displayImage = product?.featureImage || product?.images?.[0] || "";

              return (
                <TableRow key={item._id} hover>
                  <TableCell>
                    {displayImage ? (
                      <img src={displayImage} alt={product?.name || "Product"} style={{ width: 46, height: 46, borderRadius: 6, objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 46, height: 46, borderRadius: 6, background: "#f1f3f8" }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{product?.name || "Deleted product"}</TableCell>
                  <TableCell>{categoryName || "-"}</TableCell>
                  <TableCell align="right">{product ? `₹${product.salePrice ?? product.price}` : "-"}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell sx={{ textAlign: "right" }}>
                    <IconButton size="small" onClick={() => void handleRemove(item._id)} sx={{ color: "#f46a6a" }}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {items.length > 0 ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2.2}>
            <Typography variant="body2" color="var(--skote-subtle)">
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

        {items.length === 0 ? (
          <Typography sx={{ mt: 2, textAlign: "center", color: "var(--skote-subtle)" }}>
            No wishlist products found.
          </Typography>
        ) : null}
      </Paper>
    </Stack>
  );
};
