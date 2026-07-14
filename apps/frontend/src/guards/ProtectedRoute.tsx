import React from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
    const userRole = localStorage.getItem("userRole"); // null -> user is logged out

    // if requiredRole is not given and the user is logged out, navigate to login page
    if (!requiredRole && !userRole) {
        toast.warning("Please login to continue")
        return <Navigate to="/auth" replace />;
    }

    // if a required role is given and it does not match the role of the user, navigate to homepage
    if (!!requiredRole && userRole !== requiredRole) {
        console.log(userRole, requiredRole)
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
