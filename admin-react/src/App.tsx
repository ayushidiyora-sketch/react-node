import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { AdminLayout } from "./layouts/AdminLayout.tsx";
import { SellerLayout } from "./layouts/SellerLayout.tsx";
import { ChangePasswordPage } from "./pages/auth/ChangePasswordPage.tsx";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage.tsx";
import { LoginPage } from "./pages/auth/LoginPage.tsx";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage.tsx";
import { SellerRegisterPage } from "./pages/auth/SellerRegisterPage.tsx";
import { DashboardPage } from "./pages/admin/DashboardPage.tsx";
import { AddProductPage } from "./pages/admin/AddProductPage.tsx";
import { EditProductPage } from "./pages/admin/EditProductPage.tsx";
import { CategoryPage } from "./pages/admin/CategoryPage.tsx";
import { CustomersPage } from "./pages/admin/CustomersPage.tsx";
import { ModulePage } from "./pages/admin/ModulePage.tsx";
import { OrdersPage } from "./pages/admin/OrdersPage.tsx";
import { OrderDetailsPage } from "./pages/admin/OrderDetailsPage.tsx";
import { ProductsPage } from "./pages/admin/ProductsPage.tsx";
import { ShopsPage } from "./pages/admin/ShopsPage.tsx";
import { WishlistProductsPage } from "./pages/admin/WishlistProductsPage.tsx";
import { SellerApplicationsPage } from "./pages/admin/SellerApplicationsPage.tsx";
import { SellerUsersPage } from "./pages/admin/SellerUsersPage.tsx";
import { SellerSubscriptionsPage as AdminSellerSubscriptionsPage } from "./pages/admin/SellerSubscriptionsPage.tsx";
import { SellerBrandsPage } from "./pages/admin/SellerBrandsPage.tsx";
import { NotificationsPage } from "./pages/admin/NotificationsPage.tsx";
import { AdminProfilePage } from "./pages/admin/AdminProfilePage.tsx";
import { SellerDashboardPage } from "./pages/seller/SellerDashboardPage.tsx";
import { SellerBrandsManagementPage } from "./pages/seller/SellerBrandsManagementPage.tsx";
import { SellerProfilePage } from "./pages/seller/SellerProfilePage.tsx";
import { SellerCompanyInfoPage } from "./pages/seller/SellerCompanyInfoPage.tsx";
import { SellerSubscriptionsPage } from "./pages/seller/SellerSubscriptionsPage.tsx";
import { SellerAddProductPage } from "./pages/seller/SellerAddProductPage.tsx";
import { SellerEditProductPage } from "./pages/seller/SellerEditProductPage.tsx";
import { Sellermyproductpage } from "./pages/seller/Sellermyproductpage.tsx";

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/admin/login" replace />} />
    <Route path="/login" element={<Navigate to="/admin/login" replace />} />
    <Route path="/admin/login" element={<LoginPage panelRole="admin" />} />
    <Route path="/seller/login" element={<LoginPage panelRole="seller" />} />
    <Route path="/seller/register" element={<SellerRegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />

    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="profile" element={<AdminProfilePage />} />
      <Route path="change-password" element={<ChangePasswordPage />} />
      <Route path="products/add/" element={<AddProductPage />} />
      <Route path="products/:productId/edit" element={<EditProductPage />} />
      <Route path="categories" element={<CategoryPage />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="customers" element={<CustomersPage />} />
      <Route path="shops" element={<ShopsPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="wishlist-products" element={<WishlistProductsPage />} />
      <Route path="seller-applications" element={<SellerApplicationsPage />} />
      <Route path="seller-users" element={<SellerUsersPage />} />
      <Route path="seller-subscriptions" element={<AdminSellerSubscriptionsPage />} />
      <Route path="seller-brands" element={<SellerBrandsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="modules/:moduleKey" element={<ModulePage />} />
      <Route path="orders/:orderId" element={<OrderDetailsPage />} />
    </Route>

    <Route
      path="/seller"
      element={
        <ProtectedRoute allowedRoles={["seller"]}>
          <SellerLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<SellerDashboardPage />} />
      <Route path="dashboard" element={<SellerDashboardPage />} />
      <Route path="add-products" element={<SellerAddProductPage />} />
      <Route path="products" element={<Sellermyproductpage />} />
      <Route path="products/edit/:id" element={<SellerEditProductPage />} />
      <Route path="brands" element={<SellerBrandsManagementPage />} />
      <Route path="profile" element={<SellerProfilePage />} />
      <Route path="company-info" element={<SellerCompanyInfoPage />} />
      <Route path="subscriptions" element={<SellerSubscriptionsPage />} />
      <Route path="change-password" element={<ChangePasswordPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/admin/login" replace />} />
  </Routes>
);

export default App;

