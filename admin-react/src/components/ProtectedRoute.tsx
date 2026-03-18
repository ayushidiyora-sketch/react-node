import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.ts";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "seller">;
};

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role, mustChangePassword } = useAuth();
  const location = useLocation();
  const loginPath = allowedRoles?.includes("seller") && !allowedRoles.includes("admin") ? "/seller/login" : "/admin/login";

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles?.length && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={role === "seller" ? "/seller" : "/admin"} replace />;
  }

  if (mustChangePassword) {
    const requiredPath = role === "seller" ? "/seller/change-password" : "/admin/change-password";

    if (location.pathname !== requiredPath) {
      return <Navigate to={requiredPath} replace />;
    }
  }

  return <>{children}</>;
};