import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    // Redirect to login but keep the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user doesn't have the required role, redirect to their default dashboard
    const defaultPath = user.role === 'admin' ? '/admin' : user.role === 'resolver' ? '/resolver' : '/dashboard';
    return <Navigate to={defaultPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
