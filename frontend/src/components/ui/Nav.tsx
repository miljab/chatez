import { Outlet, useNavigate } from "react-router";
import { Button } from "./button";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { toast, Toaster } from "sonner";
import defaultAvatar from "@/assets/default-avatar.png";

function Nav() {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  async function handleLogout() {
    try {
      await axiosPrivate.get("/logout");

      setAuth({});
      navigate("/");
    } catch {
      toast.error("Error during logout. Try again later.");
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 flex w-full items-center justify-between border p-4 shadow-sm">
        <div>
          <h1 className="font-roboto-mono overflow-hidden text-3xl whitespace-nowrap sm:text-4xl">
            Chat<span className="text-green-600">EZ</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-8">
          <div className="flex items-center justify-center gap-2">
            <div className="shrink-0 rounded-full border p-0.5 shadow-md">
              <img
                src={auth?.user?.avatar ? auth.user.avatar : defaultAvatar}
                alt="avatar"
                className="h-8 w-8 rounded-full"
              />
            </div>
            <div className="hidden font-bold sm:block">
              {auth?.user?.username}
            </div>
          </div>
          <Button className="font-bold" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>
      <Outlet></Outlet>
      <Toaster></Toaster>
    </>
  );
}

export default Nav;
