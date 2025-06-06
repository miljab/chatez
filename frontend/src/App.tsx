import { Routes } from "react-router";
import usePublicRouter from "./routes/usePublicRouter";
import useAuthRouter from "./routes/useAuthRouter";

function App() {
  const publicRouter = usePublicRouter();
  const authRouter = useAuthRouter();

  return (
    <>
      <Routes>{publicRouter}</Routes>
      <Routes>{authRouter}</Routes>
    </>
  );
}

export default App;
