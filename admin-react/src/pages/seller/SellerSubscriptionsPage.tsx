import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { sellerPortalService } from "../../services/sellerPortalService.ts";

type Plan = {
  planName: string;
  productLimit: number;
  brandLimit: number;
  durationDays: number;
  price: number;
};

type SubscriptionRequest = {
  _id: string;
  planName: string;
  productLimit: number;
  brandLimit: number;
  startDate: string;
  expiryDate: string;
  paymentStatus: "Pending" | "Paid" | "Rejected";
  status: "pending" | "approved" | "rejected";
};

const planAccents: Record<string, string> = {
  Basic: "#26c6da",
  Starter: "#26a69a",
  Business: "#1e88e5",
  Premium: "#e53935",
};

const planFeatures = (plan: Plan): Array<{ label: string; active: boolean }> => {
  const productLabel = plan.productLimit === -1 ? "Unlimited products" : `${plan.productLimit} products`;
  const brandLabel = `${plan.brandLimit} brand${plan.brandLimit > 1 ? "s" : ""}`;
  return [
    { label: productLabel, active: true },
    { label: brandLabel, active: true },
    { label: `${plan.durationDays} days validity`, active: true },
    { label: "Product listing support", active: plan.price >= 999 },
    { label: "Priority seller support", active: plan.price >= 1499 },
    { label: "Analytics dashboard", active: plan.price >= 2999 },
    { label: "Dedicated account manager", active: plan.price >= 4999 },
  ];
};

const PlanCard = ({ plan, onSubscribe, loading }: { plan: Plan; onSubscribe: (planName: string) => void; loading: boolean }) => {
  const accent = planAccents[plan.planName] ?? "#556ee6";
  const features = planFeatures(plan);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #e8eaf6",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.10)" },
      }}
    >
      {/* Coloured header banner */}
      <Box sx={{ bgcolor: accent, px: 3, py: 1.8, textAlign: "center" }}>
        <Typography variant="subtitle1" fontWeight={800} letterSpacing={1.2} color="#ffffff" sx={{ textTransform: "uppercase" }}>
          {plan.planName} Plan
        </Typography>
      </Box>

      {/* Price */}
      <Box sx={{ px: 3, pt: 3, pb: 1.5, textAlign: "left" }}>
        <Typography variant="h3" fontWeight={800} sx={{ color: accent, lineHeight: 1 }}>
          ₹{plan.price.toLocaleString()}
        </Typography>
        <Typography variant="caption" color="text.secondary">per {plan.durationDays} days</Typography>
      </Box>

      {/* Feature list */}
      <Stack spacing={0.9} sx={{ px: 3, py: 1.5, flex: 1 }}>
        {features.map(f => (
          <Stack key={f.label} direction="row" spacing={1} alignItems="center">
            {f.active
              ? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: accent }} />
              : <CancelRoundedIcon sx={{ fontSize: 18, color: "#d0d0d0" }} />}
            <Typography variant="body2" sx={{ color: f.active ? "text.primary" : "text.disabled" }}>
              {f.label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {/* CTA button */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          onClick={() => onSubscribe(plan.planName)}
          sx={{
            bgcolor: accent,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 1.5,
            "&:hover": { bgcolor: accent, opacity: 0.88 },
          }}
        >
          Subscribe
        </Button>
      </Box>
    </Paper>
  );
};

export const SellerSubscriptionsPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<SubscriptionRequest[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [plansData, historyData] = await Promise.all([
        sellerPortalService.getPlans(),
        sellerPortalService.getMySubscriptions(),
      ]);
      setPlans(plansData.filter(plan => plan.planName !== "Free"));
      setHistory(historyData);
    } catch (loadError) {
      const loadMessage = loadError instanceof Error ? loadError.message : "Unable to fetch plans";
      setError(loadMessage);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData(); }, 0);

    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get("payment");

    if (paymentResult === "success") {
      toast.success("Payment successful. Your subscription has been activated.");
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (paymentResult === "canceled") {
      toast.error("Payment canceled. No subscription changes were made.");
      window.history.replaceState({}, "", window.location.pathname);
    }

    return () => { window.clearTimeout(timer); };
  }, []);

  const handleSubscribe = async (planName: string) => {
    setSubmitting(true);
    try {
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/seller/subscriptions?payment=success`;
      const cancelUrl = `${baseUrl}/seller/subscriptions?payment=canceled`;
      const session = await sellerPortalService.createSubscriptionCheckout(planName, successUrl, cancelUrl);
      window.location.assign(session.checkoutUrl);
    } catch (requestError) {
      const msg = requestError instanceof Error ? requestError.message : "Unable to request plan";
      toast.error(msg);
      setSubmitting(false);
      return;
    } finally {
      // Keep loading state until redirect happens in successful checkout creation.
    }
  };

  return (
    <Stack spacing={3}>
      {/* Page header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack>
          <Typography variant="h5" fontWeight={700} color="var(--skote-heading)">Subscription Plans</Typography>
          <Typography variant="body2" color="var(--skote-subtle)">Packages Pricing Table</Typography>
        </Stack>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {/* Plan cards */}
      <Grid container spacing={2.5}>
        {plans.map(plan => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={plan.planName}>
            <PlanCard plan={plan} onSubscribe={handleSubscribe} loading={submitting} />
          </Grid>
        ))}
      </Grid>

      {/* Subscription history */}
      <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)" mb={2}>Subscription History</Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8f9fb" }}>
              <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Limits</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Start</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Expiry</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "text.secondary", py: 3 }}>No subscription requests yet.</TableCell>
              </TableRow>
            ) : history.map(item => (
              <TableRow key={item._id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{item.planName}</TableCell>
                <TableCell>{item.productLimit === -1 ? "Unlimited" : item.productLimit} products / {item.brandLimit} brands</TableCell>
                <TableCell>{new Date(item.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={item.paymentStatus}
                    size="small"
                    sx={{
                      bgcolor: item.paymentStatus === "Paid" ? "#e8f5e9" : item.paymentStatus === "Rejected" ? "#ffebee" : "#fff8e1",
                      color: item.paymentStatus === "Paid" ? "#2e7d32" : item.paymentStatus === "Rejected" ? "#c62828" : "#f57f17",
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    size="small"
                    sx={{
                      bgcolor: item.status === "approved" ? "#e8f5e9" : item.status === "rejected" ? "#ffebee" : "#e3f2fd",
                      color: item.status === "approved" ? "#2e7d32" : item.status === "rejected" ? "#c62828" : "#1565c0",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
};
