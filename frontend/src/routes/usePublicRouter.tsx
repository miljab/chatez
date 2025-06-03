import { Route } from "react-router";
import Home from "@/components/Home";

function usePublicRouter() {
  return (
    <>
      <Route path="/" element={<Home />} />
    </>
  );
}

export default usePublicRouter;
