import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputBase,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { type MouseEvent, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { notificationService, type AppNotification } from "@/services/notificationService";
import { clearSellerSession, readSellerSession, SELLER_SESSION_EVENT } from "@/lib/sellerSession";

const sidebarItems = [
  { label: "Dashboard", path: "/admin/seller/dashboard", icon: <DashboardRoundedIcon fontSize="small" /> },
  { label: "My Products", path: "/admin/seller/products", icon: <InventoryRoundedIcon fontSize="small" /> },
  { label: "Add Product", path: "/admin/seller/add-products", icon: <AddBoxRoundedIcon fontSize="small" /> },
  { label: "Brands", path: "/admin/seller/brands", icon: <StoreRoundedIcon fontSize="small" /> },
  { label: "Profile", path: "/admin/seller/profile", icon: <PersonRoundedIcon fontSize="small" /> },
  { label: "Company Info", path: "/admin/seller/company-info", icon: <BusinessRoundedIcon fontSize="small" /> },
  { label: "Subscriptions", path: "/admin/seller/subscriptions", icon: <CreditCardRoundedIcon fontSize="small" /> },
] as const;

export const SellerPanelLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sellerSession, setSellerSession] = useState(() => readSellerSession());
  const sellerName = sellerSession?.name || sellerSession?.fullName || "Seller";
  const sellerProfileImage = sellerSession?.profileImage || "";
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<HTMLElement | null>(null);
  const [notificationItems, setNotificationItems] = useState<AppNotification[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActiveSidebarItem = (path: string) => {
    if (path === "/admin/seller/dashboard") {
      return location.pathname === "/admin/seller" || location.pathname === "/admin/seller/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    clearSellerSession();
    navigate("/", { replace: true });
  };

  const formatNotificationTime = (value: string) => {
    const date = new Date(value);
    const now = Date.now();
    const diffMs = now - date.getTime();

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  const toTypeLabel = (item: AppNotification) => {
    if (item.itemType === "brand") {
      return "Brand";
    }

    if (item.itemType === "product") {
      return "Product";
    }

    return "Update";
  };

  const loadNotifications = async () => {
    try {
      setNotificationLoading(true);
      setNotificationError(null);

      const [items, unread] = await Promise.all([
        notificationService.getNotifications({ limit: 8 }),
        notificationService.getUnreadCount(),
      ]);

      setNotificationItems(items);
      setUnreadCount(unread);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load notifications";
      setNotificationError(message);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    const syncSellerSession = () => {
      setSellerSession(readSellerSession());
    };

    window.addEventListener("storage", syncSellerSession);
    window.addEventListener(SELLER_SESSION_EVENT, syncSellerSession as EventListener);

    return () => {
      window.removeEventListener("storage", syncSellerSession);
      window.removeEventListener(SELLER_SESSION_EVENT, syncSellerSession as EventListener);
    };
  }, []);

  const handleOpenNotifications = (event: MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationAnchorEl(null);
  };

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserAnchorEl(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f5fa" }}>
      <Grid container sx={{ minHeight: "100vh" }}>
      <Grid size={{ xs: 12, md: 3, lg: 2.4 }}>
        <Paper
          sx={{
            p: 1.5,
            borderRadius: 0,
            border: "none",
            boxShadow: "none",
            position: { md: "sticky" },
            top: 0,
            minHeight: "100vh",
            bgcolor: "#2a3042",
            color: "#dbe4ff",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ px: 0.5, py: 1.2 }}   onClick={() => navigate("/")}>
            <Avatar src={sellerProfileImage || undefined} sx={{ width: 30, height: 30, bgcolor: "#4e73df", fontSize: 13, fontWeight: 700 }}>
              {!sellerProfileImage ? sellerName.charAt(0).toUpperCase() : null}
            </Avatar>
            <Stack spacing={0.2} >
              <Typography variant="subtitle2" fontWeight={700} color="#ffffff">ShopO</Typography>
              <Typography variant="caption" color="#9fb2d9">Admin and Analytics</Typography>
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: "#3a4258", mb: 1 }} />

          <Typography variant="caption" sx={{ px: 1, py: 0.7, color: "#9aa6c3", letterSpacing: 1.2, fontWeight: 700 }}>
            MENU
          </Typography>

          <Stack spacing={0.6}>
            {sidebarItems.map(item => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                fullWidth
                variant={isActiveSidebarItem(item.path) ? "contained" : "text"}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  borderRadius: 1.2,
                  px: 1.5,
                  py: 0.95,
                  fontSize: 13,
                  bgcolor: isActiveSidebarItem(item.path) ? "#3a4367" : "transparent",
                  color: isActiveSidebarItem(item.path) ? "#ffffff" : "#a8b3cf",
                  "&:hover": {
                    bgcolor: isActiveSidebarItem(item.path) ? "#46507a" : "#343d58",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}

            <Divider sx={{ borderColor: "#3a4258", my: 1 }} />

            <Button
              onClick={handleLogout}
              startIcon={<LogoutRoundedIcon fontSize="small" />}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                borderRadius: 1.5,
                px: 1.5,
                py: 1,
                color: "#fda4af",
                "&:hover": {
                  bgcolor: "#3b2a36",
                },
              }}
            >
              Logout
            </Button>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 9, lg: 9.6 }}>
        <Stack spacing={2} sx={{ minHeight: "100vh" }}>
          <Paper
            sx={{
              px: { xs: 1.5, md: 2.5 },
              py: 1,
              borderRadius: 0,
              border: "none",
              borderBottom: "1px solid #e6e9f2",
              boxShadow: "none",
              bgcolor: "#ffffff",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Paper
                  sx={{
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 1.2,
                    bgcolor: "#f0f2f7",
                    border: "1px solid #e6e9f2",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    minWidth: { xs: 150, md: 260 },
                  }}
                >
                  <SearchRoundedIcon sx={{ fontSize: 18, color: "#8b95ad" }} />
                  <InputBase placeholder="Search..." sx={{ fontSize: 14, width: "100%", color: "#4f5d7a" }} />
                </Paper>
              </Stack>

              <Stack direction="row" spacing={0.6} alignItems="center">
                <IconButton size="small" sx={{ color: "#707b97" }}><LanguageRoundedIcon fontSize="small" /></IconButton>
                <IconButton size="small" sx={{ color: "#707b97" }}><AppsRoundedIcon fontSize="small" /></IconButton>
                <IconButton size="small" sx={{ color: "#707b97" }}><SettingsRoundedIcon fontSize="small" /></IconButton>
                <IconButton size="small" sx={{ color: "#707b97" }} onClick={handleOpenNotifications}>
                  <Badge color="error" badgeContent={unreadCount}><NotificationsNoneRoundedIcon fontSize="small" /></Badge>
                </IconButton>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.8, borderColor: "#e6e9f2" }} />
                <IconButton size="small" onClick={handleOpenUserMenu} sx={{ p: 0.2 }}>
                  <Avatar src={sellerProfileImage || undefined} sx={{ width: 30, height: 30, bgcolor: "#4e73df", fontSize: 13 }}>
                    {!sellerProfileImage ? sellerName.charAt(0).toUpperCase() : null}
                  </Avatar>
                </IconButton>
                <Stack spacing={0} sx={{ display: { xs: "none", md: "flex" } }}>
                  <Typography variant="caption" sx={{ color: "#24324d", fontWeight: 700 }}>{sellerName}</Typography>
                  <Typography variant="caption" sx={{ color: "#8b95ad", lineHeight: 1.1 }}>admin@shopo.com</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Paper>

          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleCloseNotifications}
            PaperProps={{
              sx: {
                width: 340,
                mt: 1,
                borderRadius: 2,
                border: "1px solid #e6e9f2",
                boxShadow: "0 16px 40px rgba(18, 38, 63, 0.15)",
              },
            }}
          >
            <Box sx={{ px: 1.5, py: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" fontWeight={700} color="#24324d">Notifications</Typography>
                {notificationItems.length > 0 ? (
                  <Button
                    size="small"
                    onClick={async () => {
                      await notificationService.markAllAsRead();
                      await loadNotifications();
                    }}
                    sx={{ textTransform: "none", fontSize: 12 }}
                  >
                    Mark all read
                  </Button>
                ) : null}
              </Stack>
            </Box>
            <Divider />
            {notificationLoading ? (
              <MenuItem disabled>
                <Typography variant="body2" sx={{ color: "#8b95ad" }}>Loading notifications...</Typography>
              </MenuItem>
            ) : null}

            {!notificationLoading && notificationError ? (
              <MenuItem disabled>
                <Typography variant="body2" sx={{ color: "#d14d6f", whiteSpace: "normal" }}>{notificationError}</Typography>
              </MenuItem>
            ) : null}

            {!notificationLoading && !notificationError && notificationItems.length === 0 ? (
              <MenuItem disabled>
                <Typography variant="body2" sx={{ color: "#8b95ad" }}>No notifications available.</Typography>
              </MenuItem>
            ) : null}

            {!notificationLoading && !notificationError && notificationItems.map(item => (
              <MenuItem
                key={item._id}
                onClick={async () => {
                  if (!item.isRead) {
                    await notificationService.markAsRead(item._id);
                    await loadNotifications();
                  }
                  handleCloseNotifications();
                }}
                sx={{ py: 1.2, alignItems: "flex-start", bgcolor: item.isRead ? "transparent" : "#f7f9ff" }}
              >
                <ListItemText
                  primary={<Typography variant="body2" sx={{ color: "#32405f", whiteSpace: "normal", fontWeight: item.isRead ? 500 : 700 }}>{item.message}</Typography>}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "#8b95ad" }}>{formatNotificationTime(item.createdAt)}</Typography>
                      <Chip size="small" label={toTypeLabel(item)} sx={{ height: 20, fontSize: 11, bgcolor: "#eef2ff", color: "#4a5fd4" }} />
                    </Stack>
                  }
                />
              </MenuItem>
            ))}
          </Menu>

          <Menu
            anchorEl={userAnchorEl}
            open={Boolean(userAnchorEl)}
            onClose={handleCloseUserMenu}
            PaperProps={{
              sx: {
                width: 220,
                mt: 1,
                borderRadius: 2,
                border: "1px solid #e6e9f2",
                boxShadow: "0 16px 40px rgba(18, 38, 63, 0.15)",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleCloseUserMenu();
                navigate("/admin/seller/profile");
              }}
            >
              <PersonOutlineRoundedIcon fontSize="small" sx={{ mr: 1.2, color: "#66789c" }} />
              <Typography variant="body2">User Profile</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseUserMenu();
                navigate("/admin/change-password");
              }}
            >
              <LockResetRoundedIcon fontSize="small" sx={{ mr: 1.2, color: "#66789c" }} />
              <Typography variant="body2">Change Password</Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleCloseUserMenu();
                handleLogout();
              }}
            >
              <LogoutRoundedIcon fontSize="small" sx={{ mr: 1.2, color: "#d14d6f" }} />
              <Typography variant="body2" sx={{ color: "#d14d6f" }}>Logout</Typography>
            </MenuItem>
          </Menu>

          <Box sx={{ px: { xs: 1, md: 2.5 }, pb: 2.5 }}>
            <Outlet />
          </Box>
        </Stack>
      </Grid>
    </Grid>
    </Box>
  );
};
