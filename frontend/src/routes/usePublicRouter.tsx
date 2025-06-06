import { Route } from "react-router";
import SignUp from "@/components/SignUp";
import Login from "@/components/Login";
import LandingPage from "@/components/LandingPage";
import RequireGuest from "@/components/RequireGuest";

function usePublicRouter() {
  return (
    <Route element={<RequireGuest />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
    </Route>
  );
}

export default usePublicRouter;
