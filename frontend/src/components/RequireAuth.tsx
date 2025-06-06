import useAuth from "../hooks/useAuth";
import { Navigate, Outlet } from "react-router";

function RequireAuth() {
  const { auth } = useAuth();

  return auth?.accessToken ? <Outlet /> : <Navigate to="/login" />;
}

export default RequireAuth;
