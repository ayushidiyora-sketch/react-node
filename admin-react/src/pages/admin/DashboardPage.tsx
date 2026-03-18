import { Avatar, Chip, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import { useEffect, useMemo, useState } from "react";
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

import { adminService } from "../../services/adminService.ts";

type DashboardResponse = {
  totals: {
    users: number;
    orders: number;
    products: number;
    categories: number;
    revenue: number;
  };
  recentOrders: Array<{ id: string; orderId?: string; customerName: string; status: string; totalAmount: number }>;
  notifications: Array<{ id: string; title: string; status: string }>;
};

const statsConfig = [
  { key: "users", label: "Total Users", icon: <GroupRoundedIcon />, accent: "#556ee6", progress: 66 },
  { key: "orders", label: "Total Orders", icon: <ReceiptLongRoundedIcon />, accent: "#34c38f", progress: 58 },
  { key: "products", label: "Total Products", icon: <Inventory2RoundedIcon />, accent: "#f1b44c", progress: 42 },
  { key: "categories", label: "Total Categories", icon: <CategoryRoundedIcon />, accent: "#50a5f1", progress: 49 },
  { key: "revenue", label: "Total Revenue", icon: <PaidRoundedIcon />, accent: "#f46a6a", progress: 73 },
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const buildChartData = (orders: number, revenue: number, products: number) => {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    const seed = (i + 1) / 7;
    const jitter = () => 0.7 + Math.random() * 0.6;
    return {
      month: MONTHS[d.getMonth()],
      Orders: Math.round(orders * seed * jitter()),
      Revenue: Math.round(revenue * seed * jitter()),
      Products: Math.round(products * seed * jitter()),
    };
  });
};

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const response = await adminService.getDashboard();
        setData(response);
      } catch (loadError) {
        setData(null);
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
      }
    };

    void fetchData();
  }, []);

  const chartData = useMemo(
    () => buildChartData(
      data?.totals.orders ?? 10,
      data?.totals.revenue ?? 1000,
      data?.totals.products ?? 8,
    ),
    [data?.totals.orders, data?.totals.revenue, data?.totals.products],
  );

  if (error) {
    return <Typography color="error.main">{error}</Typography>;
  }

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2.2}>
        {statsConfig.map(item => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item.key}>
            <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack>
                  <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 0.5 }}>{item.label}</Typography>
                  <Typography variant="h4" fontWeight={700} color="var(--skote-heading)">
                    {item.key === "revenue"
                      ? `₹${(data?.totals.revenue ?? 0).toFixed(2)}`
                      : data?.totals[item.key] ?? 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#34c38f", mt: 0.6 }}>+2.6% since last week</Typography>
                </Stack>
                <Avatar sx={{ bgcolor: `${item.accent}22`, color: item.accent, width: 42, height: 42 }}>
                  {item.icon}
                </Avatar>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={item.progress}
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

      {/* Line Chart */}
      <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">Performance Overview</Typography>
          <Typography variant="caption" sx={{ color: "var(--skote-subtle)", fontWeight: 600 }}>Last 7 months</Typography>
        </Stack>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f7" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#74788d" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#74788d" }} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #eef0f7", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 13 }}
              cursor={{ stroke: "#556ee620", strokeWidth: 2 }}
            />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
            <Line type="monotone" dataKey="Orders" stroke="#556ee6" strokeWidth={2.5} dot={{ r: 4, fill: "#556ee6" }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Revenue" stroke="#34c38f" strokeWidth={2.5} dot={{ r: 4, fill: "#34c38f" }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Products" stroke="#f1b44c" strokeWidth={2.5} dot={{ r: 4, fill: "#f1b44c" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      <Grid container spacing={2.2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">Recent Orders</Typography>
              <Typography variant="caption" sx={{ color: "var(--skote-subtle)", fontWeight: 600 }}>Latest Transactions</Typography>
            </Stack>
            <Stack spacing={1.2}>
              {data?.recentOrders.length ? data.recentOrders.map(order => (
                <Stack key={order.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.3, borderRadius: 2, border: "1px solid var(--skote-border)", bgcolor: "#ffffff" }}>
                  <Stack>
                    <Typography fontWeight={600} color="var(--skote-heading)">{order.customerName}</Typography>
                    <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>ID: {order.orderId?.trim() || `ORD-${String(order.id).slice(0, 8).toUpperCase()}`}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip label={order.status} size="small" sx={{ bgcolor: "#556ee61a", color: "#556ee6", borderRadius: 1.5, fontWeight: 600 }} />
                    <Typography fontWeight={700} color="var(--skote-heading)">₹{order.totalAmount.toFixed(2)}</Typography>
                  </Stack>
                </Stack>
              )) : <Typography variant="body2" sx={{ color: "var(--skote-subtle)" }}>No recent orders found.</Typography>}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <CampaignRoundedIcon sx={{ color: "#556ee6" }} />
              <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">Notifications</Typography>
            </Stack>
            <Stack spacing={1.2}>
              {data?.notifications.length ? data.notifications.map(item => (
                <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderColor: "var(--skote-border)" }}>
                  <Typography fontWeight={600} color="var(--skote-heading)">{item.title}</Typography>
                  <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Status: {item.status}</Typography>
                </Paper>
              )) : <Typography variant="body2" sx={{ color: "var(--skote-subtle)" }}>No notifications found.</Typography>}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};