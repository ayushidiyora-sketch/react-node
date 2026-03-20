import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import {
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { notificationService, type AdminNotification } from "../../services/notificationService.ts";

const pageSize = 10;

type FilterAction = "all" | "add" | "edit" | "delete";

const formatAction = (action: AdminNotification["action"]) => {
  if (action === "add") {
    return "Add";
  }

  if (action === "edit") {
    return "Edit";
  }

  return "Delete";
};

const formatItemType = (itemType: AdminNotification["itemType"]) => {
  if (itemType === "product") {
    return "Product";
  }

  return "Brand";
};

const formatDateTime = (value: string) => new Date(value).toLocaleString();

export const NotificationsPage = () => {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [actionFilter, setActionFilter] = useState<FilterAction>("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);

  const loadItems = async () => {
    setIsLoading(true);

    try {
      const data = await notificationService.getNotifications(
        actionFilter === "all"
          ? { isRead: false }
          : { action: actionFilter, isRead: false },
      );
      setItems(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch notifications";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, [actionFilter]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageRows = items.slice((page - 1) * pageSize, page * pageSize);
  const startRow = items.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = items.length === 0 ? 0 : Math.min(page * pageSize, items.length);

  useEffect(() => {
    setPage(1);
  }, [actionFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);
  
  const unreadCount = useMemo(() => items.length, [items]);

  const markAsRead = async (id: string) => {
    setActiveNotificationId(id);

    try {
      await notificationService.markAsRead(id);
      setItems(previous => previous.filter(item => item._id !== id));
      toast.success("Notification marked as read");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to mark notification as read";
      toast.error(message);
    } finally {
      setActiveNotificationId(null);
    }
  };

  const markAllAsRead = async () => {
    setIsMarkingAll(true);

    try {
      await notificationService.markAllAsRead();
      setItems([]);
      toast.success("All notifications marked as read");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to mark all notifications as read";
      toast.error(message);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.2} flexWrap="wrap">
        <Stack>
          <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">Admin Notifications</Typography>
          <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>
            Monitor seller product and brand activity in real time (polling)
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`Unread: ${unreadCount}`} color={unreadCount > 0 ? "error" : "default"} />
          <Button
            variant="outlined"
            startIcon={<DoneAllRoundedIcon />}
            onClick={() => void markAllAsRead()}
            disabled={isMarkingAll || unreadCount === 0}
          >
            Mark all as read
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2.2, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} gap={1.2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="notification-action-filter-label">Filter by Action</InputLabel>
            <Select
              labelId="notification-action-filter-label"
              label="Filter by Action"
              value={actionFilter}
              onChange={event => setActionFilter(event.target.value as FilterAction)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="add">Add</MenuItem>
              <MenuItem value="edit">Edit</MenuItem>
              <MenuItem value="delete">Delete</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={() => void loadItems()} disabled={isLoading}>Refresh</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eff2f7" }}>
              <TableCell sx={{ fontWeight: 700 }}>Seller</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Item Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Item Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date/Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 2.5, color: "var(--skote-subtle)" }}>
                  No notifications found.
                </TableCell>
              </TableRow>
            ) : pageRows.map(item => (
              <TableRow key={item._id} hover sx={{ bgcolor: item.isRead ? "transparent" : "#f6f8ff" }}>
                <TableCell>{item.sellerName}</TableCell>
                <TableCell>
                  <Chip size="small" label={formatAction(item.action)} sx={{ fontWeight: 600 }} />
                </TableCell>
                <TableCell>{formatItemType(item.itemType)}</TableCell>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.message}</TableCell>
                <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<MarkEmailReadRoundedIcon />}
                    onClick={() => void markAsRead(item._id)}
                    disabled={activeNotificationId === item._id}
                  >
                    Mark read
                  </Button>
                </TableCell>
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
