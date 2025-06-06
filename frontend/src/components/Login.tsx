import { Link } from "react-router";
import LoginForm from "./ui/LoginForm";

function Login() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-12 p-4">
      <Link to="/">
        <h1 className="font-roboto-mono overflow-hidden text-6xl whitespace-nowrap">
          Chat<span className="text-green-600">EZ</span>
        </h1>
      </Link>
      <LoginForm />
    </div>
  );
}

export default Login;
