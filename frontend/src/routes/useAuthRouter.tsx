import { Route } from "react-router";
import RequireAuth from "@/components/RequireAuth";
import Home from "@/components/Home";

function useAuthRouter() {
  return (
    <Route element={<RequireAuth />}>
      <Route path="/home" element={<Home />} />
    </Route>
  );
}

export default useAuthRouter;
