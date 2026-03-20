import { Button, Chip, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { sellerService, type SellerApplication } from "../../services/sellerService.ts";

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString();
};

const statusColor = (status: SellerApplication["status"]) => {
  if (status === "approved") {
    return "success" as const;
  }

  if (status === "rejected") {
    return "error" as const;
  }

  return "warning" as const;
};

const pageSize = 10;

export const SellerApplicationsPage = () => {
  const [items, setItems] = useState<SellerApplication[]>([]);
  const [page, setPage] = useState(1);

  const loadApplications = async () => {
    try {
      const data = await sellerService.list();
      setItems(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load seller applications";
      toast.error(message);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApplications();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: items.length,
      pending: items.filter(item => item.status === "pending").length,
      approved: items.filter(item => item.status === "approved").length,
      rejected: items.filter(item => item.status === "rejected").length,
    }),
    [items],
  );

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageRows = items.slice((page - 1) * pageSize, page * pageSize);
  const startRow = items.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = items.length === 0 ? 0 : Math.min(page * pageSize, items.length);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const updateStatus = async (id: string, status: SellerApplication["status"]) => {
    try {
      const result = await sellerService.updateStatus(id, status);
      setItems(previous => previous.map(item => (item._id === result.item._id ? result.item : item)));

      if (status === "approved" && result.credentials) {
        toast.success(`Seller approved. Login: ${result.credentials.email} / ${result.credentials.password}`);
        return;
      }

      toast.success(`Application marked as ${status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update seller status";
      toast.error(message);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">SELLER APPLICATIONS</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Sellers</Typography>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
        <Paper sx={{ p: 1.8, borderRadius: 2, border: "1px solid var(--skote-border)", boxShadow: "none", minWidth: 140 }}>
          <Typography variant="caption" color="var(--skote-subtle)">Total</Typography>
          <Typography variant="h6" fontWeight={700}>{stats.total}</Typography>
        </Paper>
        <Paper sx={{ p: 1.8, borderRadius: 2, border: "1px solid var(--skote-border)", boxShadow: "none", minWidth: 140 }}>
          <Typography variant="caption" color="var(--skote-subtle)">Pending</Typography>
          <Typography variant="h6" fontWeight={700}>{stats.pending}</Typography>
        </Paper>
        <Paper sx={{ p: 1.8, borderRadius: 2, border: "1px solid var(--skote-border)", boxShadow: "none", minWidth: 140 }}>
          <Typography variant="caption" color="var(--skote-subtle)">Approved</Typography>
          <Typography variant="h6" fontWeight={700}>{stats.approved}</Typography>
        </Paper>
        <Paper sx={{ p: 1.8, borderRadius: 2, border: "1px solid var(--skote-border)", boxShadow: "none", minWidth: 140 }}>
          <Typography variant="caption" color="var(--skote-subtle)">Rejected</Typography>
          <Typography variant="h6" fontWeight={700}>{stats.rejected}</Typography>
        </Paper>
      </Stack>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
              <TableCell sx={{ fontWeight: 700 }}>Seller</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Business</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map(item => (
              <TableRow key={item._id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{item.fullName}</Typography>
                  <Typography variant="caption" color="var(--skote-subtle)">{item.message || "No message"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{item.businessName}</Typography>
                  <Typography variant="caption" color="var(--skote-subtle)">{item.taxId || "No tax id"}</Typography>
                  {item.kycDocuments?.length ? (
                    <Stack direction="row" spacing={0.8} mt={0.6} flexWrap="wrap" useFlexGap>
                      {item.kycDocuments.map((documentPath, index) => (
                        <a
                          key={`${documentPath}-${index}`}
                          href={`${import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000"}${documentPath}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, color: "#556ee6", textDecoration: "underline" }}
                        >
                          KYC {index + 1}
                        </a>
                      ))}
                    </Stack>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Typography>{item.email}</Typography>
                  <Typography variant="caption" color="var(--skote-subtle)">{item.phone}</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={item.status} color={statusColor(item.status)} variant="outlined" />
                </TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" color="success" disabled={item.status === "approved"} onClick={() => void updateStatus(item._id, "approved")}>Approve</Button>
                    <Button size="small" variant="outlined" color="error" disabled={item.status === "rejected"} onClick={() => void updateStatus(item._id, "rejected")}>Reject</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
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
            No seller applications yet.
          </Typography>
        ) : null}
      </Paper>
    </Stack>
  );
};
