import { Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { sellerPortalService } from "../../services/sellerPortalService.ts";

type SubscriptionItem = {
  _id: string;
  sellerName: string; 
  planName: string;
  productLimit: number;
  brandLimit: number;
  startDate: string;
  expiryDate: string;
  paymentStatus: "Pending" | "Paid" | "Rejected";
  status: "pending" | "approved" | "rejected";
};

export const SellerSubscriptionsPage = () => {
  const [items, setItems] = useState<SubscriptionItem[]>([]);

  const loadItems = async () => {
    try {
      const data = await sellerPortalService.getAdminSubscriptions();
      setItems(data);
    } catch (loadError) {
      const loadMessage = loadError instanceof Error ? loadError.message : "Unable to fetch subscription requests";
      toast.error(loadMessage);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadItems();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await sellerPortalService.updateAdminSubscriptionStatus(id, status);
      toast.success(`Subscription ${status}.`);
      await loadItems();
    } catch (updateError) {
      const updateMessage = updateError instanceof Error ? updateError.message : "Unable to update subscription";
      toast.error(updateMessage);
    }
  };

  const deleteSubscription = async (id: string) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this subscription request?");

    if (!shouldDelete) {
      return;
    }

    try {
      await sellerPortalService.deleteAdminSubscription(id);
      toast.success("Subscription request deleted.");
      await loadItems();
    } catch (deleteError) {
      const deleteMessage = deleteError instanceof Error ? deleteError.message : "Unable to delete subscription";
      toast.error(deleteMessage);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">SUBSCRIPTION MANAGEMENT</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Subscriptions</Typography>
      </Stack>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
              <TableCell sx={{ fontWeight: 700 }}>Seller Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Plan Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product Limit</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Brand Limit</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Expiry Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow key={item._id} hover>
                <TableCell>{item.sellerName}</TableCell>
                <TableCell>{item.planName}</TableCell>
                <TableCell>{item.productLimit === -1 ? "Unlimited" : item.productLimit}</TableCell>
                <TableCell>{item.brandLimit}</TableCell>
                <TableCell>{new Date(item.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                <TableCell>{item.paymentStatus}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" color="success" onClick={() => void updateStatus(item._id, "approved")} disabled={item.status === "approved"}>Approve</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => void updateStatus(item._id, "rejected")} disabled={item.status === "rejected"}>Reject</Button>
                    <Button size="small"  color="error" onClick={() => void deleteSubscription(item._id)}>  <DeleteRoundedIcon fontSize="small" /></Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
};
