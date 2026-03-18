import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { type MouseEvent, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAppDispatch } from "../hooks/useAppDispatch.ts";
import { useAuth } from "../hooks/useAuth.ts";
import { notificationService, type AdminNotification } from "../services/notificationService.ts";
import { sellerPortalService } from "../services/sellerPortalService.ts";
import { logout } from "../store/slices/authSlice.ts";

const drawerWidth = 255;

const sellerMenuItems = [
  { label: "Dashboard", path: "/seller", icon: <DashboardRoundedIcon />, exact: true },
  { label: "Add Product", path: "/seller/add-products", icon: <Inventory2RoundedIcon /> },
  { label: "My Products", path: "/seller/products", icon: <Inventory2RoundedIcon /> },
  { label: "My Brands", path: "/seller/brands", icon: <StorefrontRoundedIcon /> },
  { label: "Profile", path: "/seller/profile", icon: <PersonRoundedIcon /> },
  { label: "Company Info", path: "/seller/company-info", icon: <BusinessRoundedIcon /> },
  { label: "Subscriptions", path: "/seller/subscriptions", icon: <WorkspacePremiumRoundedIcon /> },
];

const navItemStyles = {
  borderRadius: 2,
  mb: 0.25,
  px: 1.2,
  minHeight: 40,
  color: "var(--skote-sidebar-muted)",
  "&:hover": { bgcolor: "rgba(255,255,255,0.05)", color: "#ffffff" },
  "&.Mui-selected": { bgcolor: "rgba(85,110,230,0.24)", color: "#ffffff" },
  "&.Mui-selected:hover": { bgcolor: "rgba(85,110,230,0.34)" },
};

export const SellerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { admin } = useAuth();
  const [sellerProfileImage, setSellerProfileImage] = useState<string>("");
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const [notificationItems, setNotificationItems] = useState<AdminNotification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let isDisposed = false;

    const loadSellerProfileImage = async () => {
      try {
        const profile = await sellerPortalService.getProfile();
        const imagePath = profile.profileImage || "";

        if (!imagePath) {
          if (!isDisposed) {
            setSellerProfileImage("");
          }
          return;
        }

        const normalizedImage = imagePath.startsWith("http")
          ? imagePath
          : `${import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000"}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;

        if (!isDisposed) {
          setSellerProfileImage(normalizedImage);
        }
      } catch {
        if (!isDisposed) {
          setSellerProfileImage("");
        }
      }
    };

    void loadSellerProfileImage();

    return () => {
      isDisposed = true;
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout("seller"));
    navigate("/seller/login");
  };

  const closeProfileMenu = () => {
    setProfileMenuAnchor(null);
  };

  const openProfileMenu = (event: MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const openProfilePage = () => {
    closeProfileMenu();
    navigate("/seller/profile");
  };

  const openChangePasswordPage = () => {
    closeProfileMenu();
    navigate("/seller/change-password");
  };

  const logoutFromMenu = () => {
    closeProfileMenu();
    handleLogout();
  };

  const loadUnreadNotifications = async () => {
    setIsNotificationLoading(true);

    try {
      const [count, items] = await Promise.all([
        notificationService.getUnreadCount("seller"),
        notificationService.getNotifications({ isRead: false, limit: 7 }, "seller"),
      ]);

      setUnreadNotificationsCount(count);
      setNotificationItems(items);
    } catch {
      setUnreadNotificationsCount(0);
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
      await notificationService.markAsRead(id, "seller");
      setNotificationItems(previous => previous.filter(item => item._id !== id));
      setUnreadNotificationsCount(previous => Math.max(0, previous - 1));
    } catch {
      // keep UI responsive even if mark-read fails
    }

    setNotificationAnchor(null);
  };

  useEffect(() => {
    let isDisposed = false;

    const loadUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount("seller");

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

  const isSelected = (item: { path: string; exact?: boolean }) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "var(--skote-page-bg)" }}>
      {/* Sidebar */}
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
              <Typography variant="caption" color="var(--skote-sidebar-muted)">Seller Panel</Typography>
            </Box>
          </Stack>
        </Toolbar>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <Typography sx={{ px: 2.5, py: 1.5, fontSize: 11, letterSpacing: 1.1, fontWeight: 700, color: "#79829f" }}>
          MENU
        </Typography>
        <List sx={{ px: 1.5, py: 0, flex: 1 }}>
          {sellerMenuItems.map(item => (
            <ListItemButton
              key={`${item.label}-${item.path}`}
              onClick={() => navigate(item.path)}
              selected={isSelected(item)}
              sx={navItemStyles}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { fontSize: 13.5, fontWeight: 500 } }} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ p: 1.5 }}>
          <ListItemButton onClick={() => navigate("/seller/change-password")} sx={{ ...navItemStyles, mb: 0.5 }}>
            <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}><VpnKeyRoundedIcon /></ListItemIcon>
            <ListItemText primary="Change Password" slotProps={{ primary: { fontSize: 13.5, fontWeight: 500 } }} />
          </ListItemButton>
          <ListItemButton onClick={handleLogout} sx={navItemStyles}>
            <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}><LogoutRoundedIcon /></ListItemIcon>
            <ListItemText primary="Logout" slotProps={{ primary: { fontSize: 13.5, fontWeight: 500 } }} />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: "#ffffff", color: "var(--skote-heading)", borderBottom: "1px solid var(--skote-border)" }}
        >
          <Toolbar sx={{ minHeight: 70, px: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" sx={{ px: 1.5, width: { xs: 180, md: 300 }, borderRadius: 2, bgcolor: "#f3f3f9", border: "1px solid #eef0f7" }}>
                <SearchRoundedIcon sx={{ color: "#74788d", fontSize: 20 }} />
                <InputBase placeholder="Search..." sx={{ ml: 1, fontSize: 14, width: "100%" }} />
              </Stack>
            </Stack>
            <Stack direction="row" spacing={0.8} alignItems="center">
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
              <Popover
                open={Boolean(notificationAnchor)}
                anchorEl={notificationAnchor}
                onClose={() => setNotificationAnchor(null)}
                disableRestoreFocus
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 0.8,
                      width: 340,
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
                            {new Date(item.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </Stack>
              </Popover>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 0.5, cursor: "pointer", borderRadius: 2, px: 0.5, py: 0.25, "&:hover": { bgcolor: "#f3f3f9" } }} onClick={openProfileMenu}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: "#556ee6", fontSize: 14 }}>
                  <img
                    src={sellerProfileImage || undefined}
                    alt={admin?.name ?? "Seller"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: sellerProfileImage ? "block" : "none",
                    }}
                  />
                  {!sellerProfileImage ? (admin?.name?.[0]?.toUpperCase() ?? "S") : null}
                </Avatar>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography fontWeight={600} fontSize={13}>{admin?.name ?? "Seller"}</Typography>
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

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

