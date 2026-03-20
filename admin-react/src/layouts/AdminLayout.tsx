import { AppBar, Avatar, Badge, Box, Collapse, Divider, Drawer, IconButton, InputBase, List, ListItemButton, ListItemIcon, ListItemText, Popover, Stack, Toolbar, Typography } from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { Menu, MenuItem } from "@mui/material";
import { type MouseEvent, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAppDispatch } from "../hooks/useAppDispatch.ts";
import { useAuth } from "../hooks/useAuth.ts";
import { notificationService, type AdminNotification } from "../services/notificationService.ts";
import { logout } from "../store/slices/authSlice.ts";

const ecommerceMenuItems = [
  { label: "Category", path: "/admin/categories", icon: <CategoryRoundedIcon /> },
  { label: "Product", path: "/admin/products", icon: <Inventory2RoundedIcon /> },
  { label: "Add Product", path: "/admin/products/add", icon: <AddBoxRoundedIcon /> },
  { label: "Customers", path: "/admin/customers", icon: <Inventory2RoundedIcon /> },
  { label: "Shops", path: "/admin/shops", icon: <Inventory2RoundedIcon /> },
  { label: "Order", path: "/admin/orders", icon: <ReceiptLongRoundedIcon /> },
  // { label: "Seller Applications", path: "/admin/seller-applications", icon: <CategoryRoundedIcon /> },
  { label: "Seller Users", path: "/admin/seller-users", icon: <CategoryRoundedIcon /> },
  { label: "Subscription Management", path: "/admin/seller-subscriptions", icon: <CategoryRoundedIcon /> },
  { label: "Seller Brands / Shops", path: "/admin/seller-brands", icon: <CategoryRoundedIcon /> },
  { label: "Notifications", path: "/admin/notifications", icon: <NotificationsNoneRoundedIcon /> },
  { label: "Wishlist Products", path: "/admin/wishlist-products", icon: <CategoryRoundedIcon /> },
  { label: "Payment", path: "/admin/modules/payments", icon: <PaymentsRoundedIcon /> },
  { label: "Shipping", path: "/admin/modules/shipping", icon: <LocalShippingRoundedIcon /> },
  { label: "Taxes", path: "/admin/modules/taxes", icon: <CategoryRoundedIcon /> },
];

const drawerWidth = 255;

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { admin } = useAuth();
  const [ecommerceOpen, setEcommerceOpen] = useState(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const [notificationItems, setNotificationItems] = useState<AdminNotification[]>([]);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<HTMLElement | null>(null);

  const isEcommerceActive = ecommerceMenuItems.some(item => location.pathname.startsWith(item.path));
  const isNotificationDropdownOpen = Boolean(notificationAnchor);

  const formatNotificationTime = useMemo(
    () =>
      (value: string) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return "";
        }

        return date.toLocaleString();
      },
    [],
  );

  const handleLogout = () => {
    dispatch(logout("admin"));
    navigate("/admin/login");
  };

  const openProfileMenu = (event: MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const closeProfileMenu = () => {
    setProfileMenuAnchor(null);
  };

  const openProfilePage = () => {
    closeProfileMenu();
    navigate("/admin/profile");
  };

  const openChangePasswordPage = () => {
    closeProfileMenu();
    navigate("/admin/change-password");
  };

  const logoutFromMenu = () => {
    closeProfileMenu();
    handleLogout();
  };

  const loadUnreadNotifications = async () => {
    setIsNotificationLoading(true);

    try {
      const data = await notificationService.getNotifications({ isRead: false, limit: 7 });
      setNotificationItems(data);
    } catch {
      setNotificationItems([]);
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const toggleNotificationDropdown = (event: MouseEvent<HTMLElement>) => {
    if (notificationAnchor) {
      setNotificationAnchor(null);
      return;
    }

    setNotificationAnchor(event.currentTarget);
    void loadUnreadNotifications();
  };

  const handleNotificationItemClick = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotificationItems(previous => previous.filter(item => item._id !== id));
      setUnreadNotificationsCount(previous => Math.max(0, previous - 1));
    } catch {
      // Ignore dropdown item read errors to keep header interaction lightweight.
    }

    setNotificationAnchor(null);
    navigate("/admin/notifications");
  };

  useEffect(() => {
    let isDisposed = false;

    const loadUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();

        if (!isDisposed) {
          setUnreadNotificationsCount(count);
        }
      } catch {
        if (!isDisposed) {
          setUnreadNotificationsCount(0);
        }
      }
    };

    void loadUnreadCount();

    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, 15000);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "var(--skote-page-bg)" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "var(--skote-sidebar-bg)",
            color: "var(--skote-sidebar-muted)",
            border: "none",
          },
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "var(--skote-primary)", display: "grid", placeItems: "center", color: "white", fontWeight: 700 }}>
              S
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#ffffff">ShopO</Typography>
              <Typography variant="caption" color="var(--skote-sidebar-muted)">Admin and Analytics</Typography>
            </Box>
          </Stack>
        </Toolbar>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <Typography sx={{ px: 2.5, py: 1.5, fontSize: 11, letterSpacing: 1.1, fontWeight: 700, color: "#79829f" }}>
          MENU
        </Typography>
        <List sx={{ px: 1.5, py: 0 }}>
          <ListItemButton
            onClick={() => navigate("/admin")}
            selected={location.pathname === "/admin"}
            sx={{
              borderRadius: 2,
              mb: 0.25,
              px: 1.2,
              minHeight: 40,
              color: "var(--skote-sidebar-muted)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)", color: "#ffffff" },
              "&.Mui-selected": { bgcolor: "rgba(85,110,230,0.24)", color: "#ffffff" },
              "&.Mui-selected:hover": { bgcolor: "rgba(85,110,230,0.34)" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}><DashboardRoundedIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" slotProps={{ primary: { fontSize: 13.5, fontWeight: 500 } }} />
          </ListItemButton>

          <ListItemButton
            onClick={() => setEcommerceOpen(previous => !previous)}
            selected={isEcommerceActive}
            sx={{
              borderRadius: 2,
              mb: 0.25,
              px: 1.2,
              minHeight: 40,
              color: "var(--skote-sidebar-muted)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)", color: "#ffffff" },
              "&.Mui-selected": { bgcolor: "rgba(85,110,230,0.24)", color: "#ffffff" },
              "&.Mui-selected:hover": { bgcolor: "rgba(85,110,230,0.34)" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}><StorefrontRoundedIcon /></ListItemIcon>
            <ListItemText primary="Ecommerce" slotProps={{ primary: { fontSize: 13.5, fontWeight: 500 } }} />
            {ecommerceOpen ? <ExpandLessRoundedIcon sx={{ fontSize: 18 }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}
          </ListItemButton>

          <Collapse in={ecommerceOpen} timeout="auto" unmountOnExit>
            <List disablePadding sx={{ mt: 0.2 }}>
              {ecommerceMenuItems.map(item => (
                <ListItemButton
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  selected={location.pathname.startsWith(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.2,
                    ml: 1,
                    pl: 2.2,
                    minHeight: 36,
                    color: "var(--skote-sidebar-muted)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)", color: "#ffffff" },
                    "&.Mui-selected": { bgcolor: "rgba(85,110,230,0.24)", color: "#ffffff" },
                    "&.Mui-selected:hover": { bgcolor: "rgba(85,110,230,0.34)" },
                  }}
                >
                  <ListItemText primary={item.label} slotProps={{ primary: { fontSize: 13, fontWeight: 500 } }} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </List>
        <Box sx={{ mt: "auto", p: 1.5 }}>
          <ListItemButton onClick={() => navigate("/admin/change-password")} sx={{ borderRadius: 2, mb: 0.5, color: "var(--skote-sidebar-muted)" }}>
            <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}><VpnKeyRoundedIcon /></ListItemIcon>
            <ListItemText primary="Change Password" />
          </ListItemButton>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: "var(--skote-sidebar-muted)" }}>
            <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}><LogoutRoundedIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#ffffff",
            color: "var(--skote-heading)",
            borderBottom: "1px solid var(--skote-border)",
          }}
        >
          <Toolbar sx={{ minHeight: 70, px: { xs: 2, md: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" sx={{ px: 1.5, width: { xs: 180, md: 320 }, borderRadius: 2, bgcolor: "#f3f3f9", border: "1px solid #eef0f7" }}>
                <SearchRoundedIcon sx={{ color: "#74788d", fontSize: 20 }} />
                <InputBase placeholder="Search..." sx={{ ml: 1, fontSize: 14, width: "100%" }} />
              </Stack>
            </Stack>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <IconButton sx={{ color: "#74788d" }}><LanguageRoundedIcon /></IconButton>
              <IconButton sx={{ color: "#74788d" }}><GridViewRoundedIcon /></IconButton>
              <IconButton sx={{ color: "#74788d" }}><SettingsRoundedIcon /></IconButton>
              <Box>
                <IconButton sx={{ color: "#74788d" }} onClick={toggleNotificationDropdown}>
                  <Badge
                    color="error"
                    badgeContent={unreadNotificationsCount}
                    max={99}
                    invisible={unreadNotificationsCount === 0}
                  >
                    <NotificationsNoneRoundedIcon />
                  </Badge>
                </IconButton>
              </Box>
              <Popover
                open={isNotificationDropdownOpen}
                anchorEl={notificationAnchor}
                onClose={() => setNotificationAnchor(null)}
                disableRestoreFocus
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 0.8,
                      width: 360,
                      borderRadius: 2,
                      border: "1px solid var(--skote-border)",
                      boxShadow: "0 14px 30px rgba(15,23,42,0.12)",
                      overflow: "hidden",
                    },
                  },
                }}
              >
                <Stack sx={{ maxHeight: 380 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.5, py: 1.1, borderBottom: "1px solid var(--skote-border)" }}>
                    <Typography fontWeight={700} fontSize={13.5}>Notifications</Typography>
                    <Typography variant="caption" color="var(--skote-subtle)">Unread: {unreadNotificationsCount}</Typography>
                  </Stack>
                  <Box sx={{ overflowY: "auto" }}>
                    {isNotificationLoading ? (
                      <Typography sx={{ p: 1.8, fontSize: 13, color: "var(--skote-subtle)" }}>Loading notifications...</Typography>
                    ) : notificationItems.length === 0 ? (
                      <Typography sx={{ p: 1.8, fontSize: 13, color: "var(--skote-subtle)" }}>No unread notifications.</Typography>
                    ) : (
                      notificationItems.map(item => (
                        <Box
                          key={item._id}
                          onClick={() => void handleNotificationItemClick(item._id)}
                          sx={{
                            px: 1.5,
                            py: 1.1,
                            cursor: "pointer",
                            borderBottom: "1px solid #f0f2f7",
                            bgcolor: "#f8faff",
                            "&:hover": { bgcolor: "#eef3ff" },
                          }}
                        >
                          <Typography fontSize={13} fontWeight={600} lineHeight={1.35}>{item.message || item.itemName}</Typography>
                          <Typography variant="caption" sx={{ color: "var(--skote-subtle)", display: "block", mt: 0.2 }}>
                            {item.sellerName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "var(--skote-subtle)", display: "block" }}>
                            {formatNotificationTime(item.createdAt)}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                  <Box
                    onClick={() => {
                      setNotificationAnchor(null);
                      navigate("/admin/notifications");
                    }}
                    sx={{
                      py: 1.1,
                      textAlign: "center",
                      cursor: "pointer",
                      borderTop: "1px solid var(--skote-border)",
                      bgcolor: "#fff",
                      "&:hover": { bgcolor: "#f6f8ff" },
                    }}
                  >
                    <Typography fontSize={12.5} fontWeight={600} color="#556ee6">View all notifications</Typography>
                  </Box>
                </Stack>
              </Popover>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                onClick={openProfileMenu}
                sx={{ ml: 0.5, cursor: "pointer", borderRadius: 2, px: 0.5, py: 0.25, "&:hover": { bgcolor: "#f3f3f9" } }}
              >
                <Avatar sx={{ width: 34, height: 34, bgcolor: "#556ee6", fontSize: 14 }}>{admin?.name?.[0] ?? "A"}</Avatar>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography fontWeight={600} fontSize={13}>{admin?.name ?? "Admin"}</Typography>
                  <Typography variant="caption" color="var(--skote-subtle)">{admin?.email}</Typography>
                </Box>
              </Stack>
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={closeProfileMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={openProfilePage}>
                  <ListItemIcon><PersonRoundedIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </MenuItem>
                <MenuItem onClick={openChangePasswordPage}>
                  <ListItemIcon><VpnKeyRoundedIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Change Password" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={logoutFromMenu}>
                  <ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Typography variant="h5" fontWeight={700} color="var(--skote-heading)">Dashboard</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <CampaignRoundedIcon sx={{ fontSize: 18, color: "var(--skote-subtle)" }} />
              <Typography variant="body2" color="var(--skote-subtle)">Overview</Typography>
            </Stack>
          </Stack>
          <Outlet />
        </Box>
        <Box
          component="footer"
          sx={{
            px: { xs: 2, md: 3 },
            py: 1.6,
            borderTop: "1px solid var(--skote-border)",
            bgcolor: "#ffffff",
          }}
        >
          <Typography variant="body2" color="var(--skote-subtle)">
            © {new Date().getFullYear()} ShopO Admin Panel. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};