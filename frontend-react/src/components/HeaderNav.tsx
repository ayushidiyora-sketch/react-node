import { Heart, ShoppingCart, ChevronDown, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { categoryService } from "@/services/categoryService";
import { SellerAuthModal } from "@/components/SellerAuthModal";
import { clearSellerSession, readSellerSession, SELLER_SESSION_EVENT } from "@/lib/sellerSession";

const navItems = [
  { label: "Homepage", path: "/", hasDropdown: false },
  { label: "Shop", path: "/shop", hasDropdown: false },
  { label: "About", path: "/about", hasDropdown: false },
  { label: "Blog", path: "/blog", hasDropdown: false },
  { label: "Contact", path: "/contact", hasDropdown: false },
];

export const TopBar = () => {
  const [isSellerModalOpen, setSellerModalOpen] = useState(false);
  const [sellerMode, setSellerMode] = useState<"login" | "register">("login");

  return (
    <>
      <div className="bg-topbar text-topbar">
        <div className="container mx-auto flex items-center justify-between py-2 text-sm">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => {
                setSellerMode("login");
                setSellerModalOpen(true);
              }}
              className="hover:text-primary-foreground transition-colors"
            >
              Seller Login
            </button>
            <button
              type="button"
              onClick={() => {
                setSellerMode("register");
                setSellerModalOpen(true);
              }}
              className="hover:text-primary-foreground transition-colors"
            >
              Seller Register
            </button>
            <a href="#" className="hover:text-primary-foreground transition-colors">Track Order</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Support</a>
          </div>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1 cursor-pointer">🇺🇸 United State <ChevronDown className="w-3 h-3" /></span>
            <span className="flex items-center gap-1 cursor-pointer">USD <ChevronDown className="w-3 h-3" /></span>
            <span className="flex items-center gap-1 cursor-pointer">English <ChevronDown className="w-3 h-3" /></span>
          </div>
        </div>
      </div>
      <SellerAuthModal
        open={isSellerModalOpen}
        initialMode={sellerMode}
        onClose={() => setSellerModalOpen(false)}
      />
    </>
  );
};

export const Header = () => {
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSellerModalOpen, setSellerModalOpen] = useState(false);
  const [sellerMode, setSellerMode] = useState<"login" | "register">("login");
  const [sellerSession, setSellerSession] = useState(() => readSellerSession());
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  const sellerToken = localStorage.getItem("sellerToken") || localStorage.getItem("seller-token");
  const sellerName = sellerSession?.name || sellerSession?.fullName || "Seller";
  const sellerEmail = sellerSession?.email || "seller@shopo.com";
  const sellerProfileImage = sellerSession?.profileImage || "";

  const isSellerLoggedIn = Boolean(sellerToken);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const syncSellerSession = () => {
      setSellerSession(readSellerSession());
    };

    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("storage", syncSellerSession);
    window.addEventListener(SELLER_SESSION_EVENT, syncSellerSession as EventListener);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("storage", syncSellerSession);
      window.removeEventListener(SELLER_SESSION_EVENT, syncSellerSession as EventListener);
    };
  }, []);

  return (
    <>
      <div className="bg-background border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link to="/" className="text-3xl font-bold font-display tracking-tight text-foreground">
            <span className="text-primary">●</span> ShopO
          </Link>
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <input
              type="text"
              placeholder="Search Product..."
              className="flex-1 px-4 py-2.5 border border-border rounded-l-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <select className="px-3 py-2.5 border border-l-0 border-border bg-secondary text-muted-foreground text-sm">
              <option>All Categories</option>
            </select>
            <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-r-md font-medium hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/wishlist" className="relative text-foreground hover:text-primary transition-colors">
              <Heart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>
            </Link>
            <Link to="/cart" className="relative text-foreground hover:text-primary transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            </Link>

            {isSellerLoggedIn ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(current => !current)}
                  className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 hover:bg-secondary transition-colors"
                >
                  {sellerProfileImage ? (
                    <img
                      src={sellerProfileImage}
                      alt={sellerName}
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {sellerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden md:flex flex-col text-left leading-tight">
                    <span className="text-xs font-semibold text-foreground">{sellerName}</span>
                    <span className="text-[11px] text-muted-foreground">{sellerEmail}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-card shadow-lg z-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/admin/seller/profile");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      User Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearSellerSession();
                        setProfileOpen(false);
                        navigate("/", { replace: true });
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-secondary transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSellerMode("login");
                  setSellerModalOpen(true);
                }}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Seller Login
              </button>
            )}
          </div>
        </div>
      </div>

      <SellerAuthModal
        open={isSellerModalOpen}
        initialMode={sellerMode}
        onClose={() => setSellerModalOpen(false)}
      />
    </>
  );
};

export const Navigation = () => {
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const items = await categoryService.list();
        setCategories(items);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchCategories();
  }, []);

  return (
    <div className="bg-nav">
      <div className="container mx-auto flex items-center">
        <div className="relative">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center gap-2 px-6 py-3.5 bg-primary-foreground/10 text-nav font-medium hover:bg-primary-foreground/20 transition-colors"
          >
            <Menu className="w-5 h-5" />
            All Categories
            <ChevronDown className="w-4 h-4" />
          </button>
          {showCategories && (
            <div className="absolute top-full left-0 w-64 bg-background shadow-lg rounded-b-md z-50 border border-border">
              {loading ? (
                <div className="px-4 py-2.5 text-sm text-muted-foreground">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="px-4 py-2.5 text-sm text-muted-foreground">No categories available</div>
              ) : (
                categories.map(cat => (
                  <Link
                    key={cat._id}
                    to={`/shop?category=${encodeURIComponent(cat.name)}`}
                    onClick={() => setShowCategories(false)}
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navItems.map(item => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-1 px-4 py-3.5 text-nav text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              {item.label}
              {item.hasDropdown && <ChevronDown className="w-3 h-3" />}
            </Link>
          ))}
          <Link to="/wishlist" className="flex items-center gap-1 px-4 py-3.5 text-nav text-sm font-medium hover:bg-primary-foreground/10 transition-colors">
            Wishlist
          </Link>
        </nav>
        {/* <Link to="/become-seller" className="ml-auto px-5 py-2 bg-foreground text-background text-sm font-semibold rounded-md my-2 hover:opacity-90 transition-opacity flex items-center gap-1">
          Become a Seller <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
        </Link> */}
      </div>
    </div>
  );
};
