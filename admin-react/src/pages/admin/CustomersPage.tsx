import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Alert, Button, Checkbox, Chip, CircularProgress, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { adminService, type CustomerHistoryItem } from "../../services/adminService.ts";

const formatDate = (value: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const pageSize = 10;

export const CustomersPage = () => {
  const [rows, setRows] = useState<CustomerHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await adminService.listCustomerHistory();
        setRows(response.items);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Unable to fetch customer history";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, []);

  const filteredRows = useMemo(
    () =>
      rows.filter(item => {
        const haystack = `${item.name} ${item.email} ${item.phone} ${item.customerType} ${item.historySummary}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [rows, search],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const startRow = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = filteredRows.length === 0 ? 0 : Math.min(page * pageSize, filteredRows.length);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">CUSTOMERS</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Customers</Typography>
      </Stack>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" mb={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              size="small"
              placeholder="search..."
              value={search}
              onChange={event => {
                setSearch(event.target.value);
                setPage(1);
              }}
              sx={{ minWidth: { xs: 220, md: 420 } }}
            />
          </Stack>
          <Button variant="contained" sx={{ bgcolor: "#34c38f", "&:hover": { bgcolor: "#2eb27f" } }} disabled>
            Customer History
          </Button>
        </Stack>

        {isLoading ? (
          <Stack alignItems="center" py={5}>
            <CircularProgress size={28} />
          </Stack>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : null}

        {!isLoading && !error ? (
          <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
              <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Transactions</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Value</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Last Payment</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>History</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map(item => (
              <TableRow key={item.id} hover>
                <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>
                  <Chip
                    label={item.customerType}
                    size="small"
                    sx={{
                      bgcolor: item.customerType === "Seller" ? "#556ee61f" : "#34c38f1f",
                      color: item.customerType === "Seller" ? "#556ee6" : "#34c38f",
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>
                  <Chip
                    icon={<StarRoundedIcon sx={{ "&.MuiSvgIcon-root": { color: "#ffffff !important", fontSize: 15 } }} />}
                    label={item.transactionCount}
                    size="small"
                    sx={{ bgcolor: "#34c38f", color: "#ffffff", fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>₹{item.totalAmount.toLocaleString()}</TableCell>
                <TableCell>{formatDate(item.lastPaymentDate)}</TableCell>
                <TableCell>{item.historySummary}</TableCell>
                <TableCell><MoreHorizRoundedIcon sx={{ color: "#74788d" }} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        ) : null}

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2.2}>
          <Typography variant="body2" color="var(--skote-subtle)">
            Showing {startRow}-{endRow} of {filteredRows.length} Results
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
