import RegisterForm from "./ui/RegisterForm";
import { Link } from "react-router";

function SignUp() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-12 p-4">
      <Link to="/">
        <h1 className="font-roboto-mono overflow-hidden text-6xl whitespace-nowrap">
          Chat<span className="text-green-600">EZ</span>
        </h1>
      </Link>
      <RegisterForm></RegisterForm>
    </div>
  );
}

export default SignUp;
