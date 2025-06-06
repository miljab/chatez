import { useEffect } from "react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.showToast) {
      toast.success(location.state.message);

      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <>
      <div className="font-roboto m-auto flex min-h-[100vh] w-1/2 min-w-[320px] flex-col items-center justify-center gap-4 p-4">
        <h1 className="font-roboto-mono animate-logo-typing w-[6ch] overflow-hidden border-r-4 border-black text-7xl whitespace-nowrap sm:text-8xl">
          Chat<span className="text-green-600">EZ</span>
        </h1>
        <h2 className="font-roboto-mono text-center whitespace-nowrap">
          Streamlined Chatting, <br className="sm:hidden" />
          Zero Distractions.
        </h2>
        <div className="flex gap-8">
          <Button asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
          <Button variant={"outline"} asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
        <p className="animate-fade-in mt-12 px-2 text-justify text-lg italic">
          Discover the simplicity of modern communication with ChatEZ - a
          lightweight chat platform designed for clarity and ease. Built as a
          practice project, ChatEZ prioritizes intuitive design and reliable
          performance. Whether you're coordinating with friends or testing new
          features, it's the straightforward solution for meaningful
          conversations. Try it now and experience chat, simplified.
        </p>
      </div>
      <Toaster />
    </>
  );
}

export default LandingPage;
