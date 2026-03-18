import { Avatar, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
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

export const SellerUsersPage = () => {
  const [items, setItems] = useState<SellerUser[]>([]);

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
            {items.map(item => (
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
      </Paper>
    </Stack>
  );
};
