import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./card";
import { Link, useNavigate } from "react-router";
import axios from "@/api/axios";
import type { AxiosError } from "axios";
import useAuth from "@/hooks/useAuth";

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type ServerErrorResponse = {
  message?: string;
};

function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const response = await axios.post("/login", data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const accessToken = response?.data?.accessToken;
      const user = response?.data?.user;

      setAuth({ accessToken, user });

      navigate("/home");
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>;

      if (axiosError.response?.data?.message) {
        form.setError("root", {
          type: "server",
          message: axiosError.response.data.message,
        });
      } else {
        form.setError("root", {
          type: "server",
          message: "Network error. Please try again.",
        });
      }
    }
  }

  return (
    <Card className="w-full max-w-md px-2 py-12">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your username and password to login.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {form.formState.errors.root && (
              <div className="text-destructive mb-4 flex justify-center text-sm">
                {form.formState.errors.root.message}
              </div>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input required maxLength={32} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" required maxLength={64} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="mt-8 flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <p>
              Don't have an account yet?{" "}
              <Link
                to="/signup"
                className="text-green-600 underline hover:text-green-800"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default LoginForm;
