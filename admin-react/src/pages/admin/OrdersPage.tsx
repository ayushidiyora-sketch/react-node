import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Box, Button, Checkbox, Chip, MenuItem, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { orderService } from "../../services/orderService.ts";

type OrderRow = {
  id: number | string;
  displayOrderId: string;
  billingName: string;
  date: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
};

const methodCycle = ["Mastercard", "Visa", "Paypal", "COD"];
const pageSizeOptions = [10, 20, 30];

const statusStyle = (status: string) => {
  if (status === "Paid") {
    return { bgcolor: "#34c38f1f", color: "#34c38f" };
  }

  if (status === "Pending") {
    return { bgcolor: "#556ee61f", color: "#556ee6" };
  }

  if (status === "Refund") {
    return { bgcolor: "#f1b44c1f", color: "#f1b44c" };
  }

  if (status === "Chargeback") {
    return { bgcolor: "#f46a6a1f", color: "#f46a6a" };
  }

  return { bgcolor: "#eff2f7", color: "#556070" };
};

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<OrderRow[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      const response = await orderService.list();
      const mappedRows = response.map((item, index) => ({
        id: item._id,
        displayOrderId: item.orderId?.trim() || `ORD-${String(item._id).slice(0, 8).toUpperCase()}`,
        billingName: item.customerName,
        date: new Date(item.orderDate ?? item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        total: item.totalPrice,
        paymentStatus: item.paymentMethod === "Credit / Debit Card" ? "Paid" : "Pending",
        paymentMethod: item.paymentMethod || methodCycle[index % methodCycle.length],
      }));

      setRows(mappedRows);
    };

    void loadOrders();
  }, []);

  const filteredRows = useMemo(
    () =>
      rows.filter(item => {
        const haystack = `${item.id} ${item.displayOrderId} ${item.billingName} ${item.paymentMethod}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [rows, search],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">ORDERS</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Orders</Typography>
      </Stack>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" mb={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              select
              size="small"
              value={pageSize}
              onChange={event => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              sx={{ minWidth: 140 }}
            >
              {pageSizeOptions.map(option => (
                <MenuItem key={option} value={option}>Show {option}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              placeholder="26 records..."
              value={search}
              onChange={event => {
                setSearch(event.target.value);
                setPage(1);
              }}
              sx={{ minWidth: { xs: 220, md: 420 } }}
            />
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
              <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Billing Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>View Details</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map(item => (
              <TableRow key={item.id} hover>
                <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#495057" }}>{item.displayOrderId}</TableCell>
                <TableCell>{item.billingName}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>₹ {item.total.toFixed(0)}</TableCell>
                <TableCell>
                  <Chip label={item.paymentStatus} size="small" sx={{ ...statusStyle(item.paymentStatus), fontWeight: 600 }} />
                </TableCell>
                <TableCell>{item.paymentMethod}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/admin/orders/${item.id}`)}
                    sx={{ textTransform: "none", borderRadius: 5, bgcolor: "#556ee6", "&:hover": { bgcolor: "#4d63ce" } }}
                  >
                    View Details
                  </Button>
                </TableCell>                                                                                                                                          
                <TableCell>
                  <Stack direction="row" spacing={1.2}>
                    <Box component="span" sx={{ color: "#34c38f", cursor: "pointer" }}><EditRoundedIcon fontSize="small" /></Box>
                    <Box component="span" sx={{ color: "#f46a6a", cursor: "pointer" }}><DeleteRoundedIcon fontSize="small" /></Box>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2.2}>
          <Typography variant="body2" color="var(--skote-subtle)">
            Showing {Math.min(pageSize, filteredRows.length)} of {filteredRows.length} Results
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
      </Paper>
    </Stack>
  );
};
