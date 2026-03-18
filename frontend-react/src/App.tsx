import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Shop from "./pages/Shop.tsx";
import Blog from "./pages/Blog.tsx";
import FAQ from "./pages/FAQ.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Cart from "./pages/Cart.tsx";
import Wishlist from "./pages/Wishlist.tsx";
import ProductDetails from "./pages/ProductDetails.tsx";
import Checkout from "./pages/Checkout.tsx";
import ThankYou from "./pages/ThankYou.tsx";
import BecomeSeller from "./pages/BecomeSeller.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import SellerLogin from "./pages/SellerLogin.tsx";
import SellerRegister from "./pages/SellerRegister.tsx";
import { SellerPanelLayout } from "./components/seller/SellerPanelLayout";
import { SellerDashboardPage } from "./pages/admin/seller/SellerDashboardPage";
import { SellerAddProductPage } from "./pages/admin/seller/SellerAddProductPage";
import { Sellermyproductpage } from "./pages/admin/seller/Sellermyproductpage";
import { SellerEditProductPage } from "./pages/admin/seller/SellerEditProductPage";
import { SellerBrandsManagementPage } from "./pages/admin/seller/SellerBrandsManagementPage";
import { SellerProfilePage } from "./pages/admin/seller/SellerProfilePage";
import { SellerCompanyInfoPage } from "./pages/admin/seller/SellerCompanyInfoPage";
import { SellerSubscriptionsPage } from "./pages/admin/seller/SellerSubscriptionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WishlistProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/thank-you/:orderId" element={<ThankYou />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/products/:slug" element={<ProductDetails />} />
              <Route path="/become-seller" element={<BecomeSeller />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/seller/login" element={<SellerLogin />} />
              <Route path="/seller/register" element={<SellerRegister />} />
              <Route path="/admin/seller" element={<SellerPanelLayout />}>
                <Route index element={<SellerDashboardPage />} />
                <Route path="dashboard" element={<SellerDashboardPage />} />
                <Route path="add-products" element={<SellerAddProductPage />} />
                <Route path="products" element={<Sellermyproductpage />} />
                <Route path="products/edit/:id" element={<SellerEditProductPage />} />
                <Route path="brands" element={<SellerBrandsManagementPage />} />
                <Route path="profile" element={<SellerProfilePage />} />
                <Route path="company-info" element={<SellerCompanyInfoPage />} />
                <Route path="subscriptions" element={<SellerSubscriptionsPage />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </WishlistProvider>
  </QueryClientProvider>
);

export default App;
