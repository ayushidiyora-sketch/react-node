import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { Avatar, Box, Grid, Paper, Stack, Typography } from "@mui/material";

type Shop = {
  id: string;
  name: string;
  initial: string;
  avatarBg: string;
  avatarColor: string;
  products: number;
  walletBalance: number;
};

const shopsData: Shop[] = [
  { id: "1", name: "Brendle's", initial: "B", avatarBg: "#e3e8ff", avatarColor: "#556ee6", products: 112, walletBalance: 13575 },
  { id: "2", name: "Tech Hifi", initial: "T", avatarBg: "#ffe8bf", avatarColor: "#f1b44c", products: 104, walletBalance: 11145 },
  { id: "3", name: "Lafayette", initial: "L", avatarBg: "#ffdbe0", avatarColor: "#f46a6a", products: 126, walletBalance: 12356 },
  { id: "4", name: "Packer", initial: "P", avatarBg: "#d4f4eb", avatarColor: "#34c38f", products: 102, walletBalance: 11228 },
  { id: "5", name: "Nedick's", initial: "N", avatarBg: "#d8ebff", avatarColor: "#50a5f1", products: 96, walletBalance: 9235 },
  { id: "6", name: "Hudson's", initial: "H", avatarBg: "#e2e4e8", avatarColor: "#556070", products: 120, walletBalance: 14794 },
  { id: "7", name: "Tech Hifi", initial: "T", avatarBg: "#e2e4e8", avatarColor: "#556070", products: 104, walletBalance: 11145 },
  { id: "8", name: "Brendle's", initial: "B", avatarBg: "#e3e8ff", avatarColor: "#556ee6", products: 112, walletBalance: 13575 },
  { id: "9", name: "Lafayette", initial: "L", avatarBg: "#d4f4eb", avatarColor: "#34c38f", products: 120, walletBalance: 12356 },
];

export const ShopsPage = () => (
  <Stack spacing={2.2}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">SHOPS</Typography>
      <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Shops</Typography>
    </Stack>

    <Grid container spacing={2.2}>
      {shopsData.map(item => (
        <Grid size={{ xs: 12, lg: 4 }} key={item.id}>
          <Paper sx={{ display: "grid", gridTemplateColumns: "1.15fr 1.85fr", borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none", overflow: "hidden" }}>
            <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ minHeight: 146 }}>
              <Avatar sx={{ bgcolor: item.avatarBg, color: item.avatarColor, width: 48, height: 48, fontWeight: 700 }}>{item.initial}</Avatar>
              <Typography variant="h6" fontWeight={500} color="var(--skote-heading)">{item.name}</Typography>
            </Stack>

            <Stack justifyContent="center" spacing={2} sx={{ px: 3, py: 2.2, borderLeft: "1px solid var(--skote-border)" }}>
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="body2" color="var(--skote-subtle)">Products</Typography>
                  <Typography variant="h5" fontWeight={500} color="var(--skote-heading)">{item.products}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="var(--skote-subtle)">Wallet Balance</Typography>
                  <Typography variant="h5" fontWeight={500} color="var(--skote-heading)">₹{item.walletBalance.toLocaleString()}</Typography>
                </Box>
              </Stack>
              <Typography sx={{ color: "#495057", textDecoration: "underline", textUnderlineOffset: 3, width: "fit-content", cursor: "pointer" }}>
                See Profile →
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>

    <Stack direction="row" justifyContent="center" py={1}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "#34c38f" }}>
        <AutorenewRoundedIcon fontSize="small" />
        <Typography color="inherit" fontWeight={500}>Load more</Typography>
      </Stack>
    </Stack>
  </Stack>
);
