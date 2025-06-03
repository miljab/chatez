import { Routes } from "react-router";
import usePublicRouter from "./routes/usePublicRouter";

function App() {
  const publicRouter = usePublicRouter();

  return <Routes>{publicRouter}</Routes>;
}

export default App;
