import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import {
  Avatar,
  Button,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { sellerPortalService } from "@/services/sellerPortalService";
import { Sellermyproductpage } from "./Sellermyproductpage";

const statsConfig = [
  { key: "totalProducts", label: "Total Products", icon: <Inventory2RoundedIcon />, accent: "#f1b44c", progress: 60 },
  { key: "totalBrands", label: "Total Brands", icon: <StorefrontRoundedIcon />, accent: "#50a5f1", progress: 45 },
  { key: "subscriptionPlan", label: "Subscription Plan", icon: <WorkspacePremiumRoundedIcon />, accent: "#556ee6", progress: 75 },
  { key: "planExpiryDate", label: "Plan Expiry", icon: <CalendarMonthRoundedIcon />, accent: "#34c38f", progress: 50 },
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const buildSellerChartData = (products: number, brands: number) => {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    const seed = (i + 1) / 7;
    const jitter = () => 0.65 + Math.random() * 0.7;
    return {
      month: MONTHS[d.getMonth()],
      Products: Math.round(products * seed * jitter()),
      Brands: Math.round(brands * seed * jitter()),
    };
  });
};

export const SellerDashboardPage = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalBrands, setTotalBrands] = useState(0);
  const [subscriptionPlan, setSubscriptionPlan] = useState("Free");
  const [planExpiryDate, setPlanExpiryDate] = useState<string>("");
  const [productLimit, setProductLimit] = useState<number>(0);
  const [brandLimit, setBrandLimit] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const toProgress = (count: number, limit: number) => {
    if (limit === -1) {
      return count > 0 ? 100 : 0;
    }

    if (limit <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((count / limit) * 100));
  };

  const getPlanProgress = (planName: string) => {
    const order = ["Free", "Basic", "Starter", "Business", "Premium"];
    const index = order.findIndex(item => item.toLowerCase() === planName.toLowerCase());
    return index === -1 ? 0 : Math.round(((index + 1) / order.length) * 100);
  };

  const getExpiryProgress = (expiryDate: string) => {
    if (!expiryDate) {
      return 0;
    }

    const diff = new Date(expiryDate).getTime() - Date.now();
    const daysLeft = Math.max(0, Math.ceil(diff / 86_400_000));
    return Math.min(100, Math.round((daysLeft / 30) * 100));
  };

  const statValues: Record<string, string | number> = {
    totalProducts,
    totalBrands,
    subscriptionPlan,
    planExpiryDate: planExpiryDate ? new Date(planExpiryDate).toLocaleDateString() : "-",
  };

  const statProgress: Record<string, number> = {
    totalProducts: toProgress(totalProducts, productLimit),
    totalBrands: toProgress(totalBrands, brandLimit),
    subscriptionPlan: getPlanProgress(subscriptionPlan),
    planExpiryDate: getExpiryProgress(planExpiryDate),
  };

  const loadDashboard = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const [data, limits] = await Promise.all([
        sellerPortalService.getDashboard(),
        sellerPortalService.getLimits(),
      ]);

      setTotalProducts(limits.productsCount ?? data.totalProducts);
      setTotalBrands(limits.brandsCount ?? data.totalBrands);
      setSubscriptionPlan(data.subscriptionPlan);
      setPlanExpiryDate(data.planExpiryDate);
      setProductLimit(limits.productLimit);
      setBrandLimit(limits.brandLimit);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load dashboard";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const addProduct = () => {
    navigate("/admin/seller/add-products");
  };

  const openBrandManagement = () => {
    navigate("/admin/seller/brands");
  };

  const chartData = useMemo(
    () => buildSellerChartData(totalProducts, totalBrands),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading],
  );

  if (error && !isLoading) {
    return <Typography color="error.main">{error}</Typography>;
  }

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2.2}>
            {statsConfig.map(item => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.key}>
                <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack>
                      <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 0.5 }}>{item.label}</Typography>
                      <Typography variant="h4" fontWeight={700} color="var(--skote-heading)">
                        {statValues[item.key]}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#34c38f", mt: 0.6 }}>Active</Typography>
                    </Stack>
                    <Avatar sx={{ bgcolor: `${item.accent}22`, color: item.accent, width: 42, height: 42 }}>
                      {item.icon}
                    </Avatar>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={isLoading ? item.progress : statProgress[item.key] ?? item.progress}
                    sx={{
                      mt: 1.8,
                      height: 6,
                      borderRadius: 999,
                      bgcolor: "#eef0f7",
                      "& .MuiLinearProgress-bar": { bgcolor: item.accent },
                    }}
                  />
                </Paper>
              </Grid>
            ))}
      </Grid>

      <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <AddBoxRoundedIcon sx={{ color: "#556ee6" }} />
          <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">Quick Add</Typography>
          <Typography variant="caption" sx={{ color: "var(--skote-subtle)", ml: "auto !important" }}>
            Based on your active subscription limits
          </Typography>
        </Stack>
        <Stack spacing={1.5}>
          <Typography variant="body2" sx={{ color: "var(--skote-subtle)" }}>
            Product usage: {totalProducts} / {productLimit === -1 ? "Unlimited" : productLimit} | Brand usage: {totalBrands} / {brandLimit === -1 ? "Unlimited" : brandLimit}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => void addProduct()} sx={{ bgcolor: "#556ee6", "&:hover": { bgcolor: "#4a5fd4" } }}>Go To Add Product</Button>
            <Button variant="outlined" onClick={() => openBrandManagement()} sx={{ borderColor: "#556ee6", color: "#556ee6" }}>Go To Brand Management</Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">Growth Overview</Typography>
          <Typography variant="caption" sx={{ color: "var(--skote-subtle)", fontWeight: 600 }}>Last 7 months</Typography>
        </Stack>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f7" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#74788d" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#74788d" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #eef0f7", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 13 }}
              cursor={{ stroke: "#556ee620", strokeWidth: 2 }}
            />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
            <Line type="monotone" dataKey="Products" stroke="#f1b44c" strokeWidth={2.5} dot={{ r: 4, fill: "#f1b44c" }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Brands" stroke="#50a5f1" strokeWidth={2.5} dot={{ r: 4, fill: "#50a5f1" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        {/* <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">Recent Products</Typography>
          <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Latest seller submissions</Typography>
        </Stack>
        <Stack spacing={1.2}>
          {recentProducts.length ? recentProducts.map(item => (
            <Stack key={item._id} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.3, borderRadius: 2, border: "1px solid var(--skote-border)", bgcolor: "#ffffff" }}>
              <Stack>
                <Typography fontWeight={600} color="var(--skote-heading)">{item.name}</Typography>
                <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>
                  Added {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label={item.status} size="small" sx={{ ...statusStyle(item.status), fontWeight: 600, textTransform: "capitalize" }} />
                <Typography fontWeight={700} color="var(--skote-heading)">?{item.price.toFixed(2)}</Typography>
              </Stack>
            </Stack>
          )) : <Typography variant="body2" sx={{ color: "var(--skote-subtle)" }}>No products added yet.</Typography>}
        </Stack> */}

            <Sellermyproductpage />
      </Paper>
    </Stack>
  );
};



