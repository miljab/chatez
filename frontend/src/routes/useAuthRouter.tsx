import { Route } from "react-router";
import RequireAuth from "@/components/RequireAuth";
import Home from "@/components/Home";
import Nav from "@/components/ui/Nav";

function useAuthRouter() {
  return (
    <Route element={<RequireAuth />}>
      <Route element={<Nav />}>
        <Route path="/home" element={<Home />} />
      </Route>
    </Route>
  );
}

export default useAuthRouter;
