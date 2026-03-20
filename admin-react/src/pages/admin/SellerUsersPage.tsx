import { Avatar, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { sellerPortalService } from "../../services/sellerPortalService.ts";

type SellerUser = {
  id: string;
  sellerName: string;
  email: string;
  profileImage?: string;
  phone: string;
  companyName: string;
  planName: string;
  status: string;
};

const pageSize = 10;

export const SellerUsersPage = () => {
  const [items, setItems] = useState<SellerUser[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await sellerPortalService.getSellerUsers();
        setItems(data);
      } catch (loadError) {
        const loadMessage = loadError instanceof Error ? loadError.message : "Unable to load sellers";
        toast.error(loadMessage);
      }
    };

    void loadItems();
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

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">SELLER USERS LIST</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Sellers</Typography>
      </Stack>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
             
              <TableCell sx={{ fontWeight: 700 }}>Seller Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Company Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Plan Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map(item => (
              <TableRow key={item.id} hover>
                <TableCell>
                <div className="seller-user-profile"> <Avatar
                    src={item.profileImage || undefined}
                    alt={item.sellerName}
                    sx={{ width: 36, height: 36, bgcolor: "#556ee6", fontSize: 13, borderRadius: "50%" }}
                  >
                    {item.sellerName?.[0]?.toUpperCase() ?? "S"}
                  </Avatar> {item.sellerName}
                </div>
                </TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.phone || "-"}</TableCell>
                <TableCell>{item.companyName || "-"}</TableCell>
                <TableCell>{item.planName}</TableCell>
                <TableCell>{item.status}</TableCell>
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
      </Paper>
    </Stack>
  );
};
