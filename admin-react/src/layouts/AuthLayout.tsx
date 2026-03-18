import { Box, Container, Paper,  Typography } from "@mui/material";
  

type AuthLayoutProps = {
  title: string;
  children: React.ReactNode;
  panelRole?: "admin" | "seller";
};

export const AuthLayout = ({ title, children }: AuthLayoutProps) => (
  <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(120deg,#f8fbff,#eef2ff)" }}>
    <Container maxWidth="sm">
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
        {/* <Stack direction="row" spacing={2} justifyContent="flex-end" mb={2}>
          {panelRole !== "admin" ? (
            <Typography component={Link} to="/admin/login" variant="body2" sx={{ textDecoration: "none", color: "#4f46e5", fontWeight: 600 }}>
              Admin Login
            </Typography>
          ) : null}
          {panelRole !== "seller" ? (
            <Typography component={Link} to="/seller/login" variant="body2" sx={{ textDecoration: "none", color: "#4f46e5", fontWeight: 600 }}>
              Seller Login
            </Typography>
          ) : null}
          <Typography component={Link} to="/seller/register" variant="body2" sx={{ textDecoration: "none", color: "#4f46e5", fontWeight: 600 }}>
            Seller Register
          </Typography>
        </Stack> */}
        <Typography variant="h4" fontWeight={700} mb={1}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          ShopO Admin Panel
        </Typography>
        {children}
      </Paper>
    </Container>
  </Box>
);