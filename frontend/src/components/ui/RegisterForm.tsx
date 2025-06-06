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

const formSchema = z
  .object({
    username: z
      .string()
      .min(5, "Username must be at least 5 characters")
      .max(32, "Username cannot exceed 32 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ServerErrorResponse = {
  errors: {
    [key in keyof z.infer<typeof formSchema>]?: string;
  };
  message?: string;
};

function RegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const navigate = useNavigate();

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await axios.post("/signup", data);

      navigate("/", {
        state: {
          showToast: true,
          message: "Account created successfully!",
        },
      });
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>;

      if (
        axiosError.response?.status === 400 &&
        axiosError.response.data?.errors
      ) {
        const fieldErrors = axiosError.response.data.errors;

        Object.entries(fieldErrors).forEach(([fieldName, message]) => {
          form.setError(fieldName as keyof z.infer<typeof formSchema>, {
            type: "server",
            message: message,
          });
        });
      } else if (axiosError.response?.data?.message) {
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
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Enter your username and password to create an account
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
                    <Input {...field} />
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
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="mt-8 flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Create Account
            </Button>
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-600 underline hover:text-green-800"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default RegisterForm;
