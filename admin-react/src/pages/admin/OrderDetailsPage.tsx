import { Box, Button, Divider,  Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { orderService } from "../../services/orderService.ts";

type OrderData = {
  _id: number | string;
  orderId?: string;
  customerName: string;
  email: string;
  address: string;
  subtotal?: number;
  shippingAmount?: number;
  taxAmount?: number;
  taxRate?: number;
  currency?: string;
  country?: string;
  totalPrice: number;
  paymentMethod: string;
  orderStatus: string;
  products: Array<{ name: string; image?: string; quantity: number; price: number }>;
  orderDate: string;
};

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000").replace(/\/$/, "");

const itemImageByName = (name: string) => {
  const normalized = name.toLowerCase();

  if (normalized.includes("headphone")) {
    return "https://cdn-icons-png.flaticon.com/512/4341/4341025.png";
  }

  if (normalized.includes("hoodie") || normalized.includes("shirt") || normalized.includes("jacket")) {
    return "https://cdn-icons-png.flaticon.com/512/2589/2589870.png";
  }

  if (normalized.includes("keyboard")) {
    return "https://cdn-icons-png.flaticon.com/512/5977/5977578.png";
  }

  return "https://cdn-icons-png.flaticon.com/512/679/679720.png";
};

const formatOrderCode = (orderId: string | undefined, id: number | string) =>
  orderId?.trim() || `ORD-${String(id).slice(0, 8).toUpperCase()}`;

const resolveProductImage = (image: string | undefined, name: string) => {
  if (!image) {
    return itemImageByName(name);
  }

  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${backendBaseUrl}${image}`;
  }

  return image;
};

export const OrderDetailsPage = () => {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError("Missing order id");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await orderService.getById(orderId);
        setOrder(response);
      } catch (loadError) {
        setOrder(null);
        setError(loadError instanceof Error ? loadError.message : "Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrder();
  }, [orderId]);

  if (isLoading) {
    return <Typography>Loading order details...</Typography>;
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Typography color="error.main">{error}</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/orders")} sx={{ width: "fit-content", bgcolor: "#74788d", "&:hover": { bgcolor: "#63677b" } }}>
          Back to Orders
        </Button>
      </Stack>
    );
  }

  if (!order) {
    return <Typography>Order not found.</Typography>;
  }

  const subTotal = order.products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const computedTotal = Number.isFinite(order.totalPrice) ? order.totalPrice : subTotal;
  const subtotal = Number.isFinite(order.subtotal) ? Number(order.subtotal) : subTotal;
  const shipping = Number.isFinite(order.shippingAmount) ? Number(order.shippingAmount) : Math.max(0, computedTotal - subtotal);
  const tax = Number.isFinite(order.taxAmount) ? Number(order.taxAmount) : Math.max(0, computedTotal - subtotal - shipping);
  const total = Number((subtotal + shipping + tax).toFixed(2));
  const formattedOrderDate = order.orderDate
    ? new Date(order.orderDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "-";
  const currencySymbol = order.currency?.toUpperCase() === "INR" ? "₹" : "$";

  return (
    <Box sx={{ display: "grid", placeItems: "start center", py: { xs: 1, md: 3 } }}>
      <Paper sx={{ width: "100%", maxWidth: "auto", borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none", overflow: "hidden" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 1.8 }}>
          <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">Order Details</Typography>
           <Button variant="contained" onClick={() => navigate("/admin/orders")} sx={{ bgcolor: "#74788d", "&:hover": { bgcolor: "#63677b" } }}>
            back
          </Button> 
        </Stack>
        <Divider />

        <Stack spacing={1.2} sx={{ px: 2.5, py: 2 }}>
          <Typography>
            <Typography component="span" color="var(--skote-subtle)">Order Id: </Typography>
            <Typography component="span" sx={{ color: "#556ee6", fontWeight: 600 }}>{formatOrderCode(order.orderId, order._id)}</Typography>
          </Typography>
          <Typography>
            <Typography component="span" color="var(--skote-subtle)">Billing Name: </Typography>
            <Typography component="span" sx={{ color: "#556ee6", fontWeight: 500 }}>{order.customerName}</Typography>
          </Typography>
          <Typography>
            <Typography component="span" color="var(--skote-subtle)">Email: </Typography>
            <Typography component="span" sx={{ color: "#556ee6", fontWeight: 500 }}>{order.email}</Typography>
          </Typography>
          <Typography>
            <Typography component="span" color="var(--skote-subtle)">Address: </Typography>
            <Typography component="span" sx={{ color: "#556ee6", fontWeight: 500 }}>{order.address}</Typography>
          </Typography>
          <Typography>
            <Typography component="span" color="var(--skote-subtle)">Payment Method: </Typography>
            <Typography component="span" sx={{ color: "#556ee6", fontWeight: 500 }}>{order.paymentMethod}</Typography>
          </Typography>
          <Typography>
            <Typography component="span" color="var(--skote-subtle)">Order Status: </Typography>
            <Typography component="span" sx={{ color: "#556ee6", fontWeight: 500 }}>{order.orderStatus}</Typography>
          </Typography>
          <Typography>
            <Typography component="span" color="var(--skote-subtle)">Order Date: </Typography>
            <Typography component="span" sx={{ color: "#556ee6", fontWeight: 500 }}>{formattedOrderDate}</Typography>
          </Typography>
        </Stack>

        <Table size="small" sx={{ px: 1.5 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: "right", pr: 3 }}>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.products.map((item, index) => (
              <TableRow key={`${item.name}-${index}`}>
                <TableCell sx={{ width: 80 }}>
                  <Box
                    component="img"
                    src={resolveProductImage(item.image, item.name)}
                    alt={item.name}
                    sx={{ width: 44, height: 44, objectFit: "contain" }}
                  />
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600} color="var(--skote-heading)">{item.name}</Typography>
                    <Typography variant="body2" color="var(--skote-subtle)">{currencySymbol} {item.price.toFixed(2)} x {item.quantity}</Typography>
                </TableCell>
                  <TableCell sx={{ textAlign: "right", pr: 3 }}>{currencySymbol} {(item.price * item.quantity).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Stack sx={{ px: 2.5, pb: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ py: 1.4, borderTop: "1px solid var(--skote-border)" }}>
            <Typography fontWeight={600}>Sub Total:</Typography>
            <Typography>{currencySymbol} {subtotal.toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ py: 1.4, borderTop: "1px solid var(--skote-border)" }}>
            <Typography fontWeight={600}>Shipping:</Typography>
            <Typography>{shipping === 0 ? "Free" : `${currencySymbol} ${shipping.toFixed(2)}`}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ py: 1.4, borderTop: "1px solid var(--skote-border)" }}>
            <Typography fontWeight={600}>Tax{order.taxRate ? ` (${order.taxRate.toFixed(2)}%)` : ""}:</Typography>
            <Typography>{currencySymbol} {tax.toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ py: 1.4, borderTop: "1px solid var(--skote-border)" }}>
            <Typography fontWeight={700}>Total:</Typography>
            <Typography fontWeight={700}>{currencySymbol} {total.toFixed(2)}</Typography>
          </Stack>
        </Stack>

        <Divider />

        
      </Paper>
    </Box>
  );
};