"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { env } from "~/env";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form"; // assuming you're using shadcn/ui

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { ChromeIcon } from "lucide-react";
import LoadingSpinner from "~/components/loading-spinner";

// Schema using zod
const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type SignInData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [serverError, setServerError] = useState("");
  const [isPending, setIsPending] = useState(false);


  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (status === "loading") return;
    if (session?.user) {
      void router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberEmail");
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail);
      form.setValue("remember", true);
    }
  }, [form]);

  const onSubmit = async (data: SignInData) => {
    setServerError("");
    setIsPending(true);

    const resp = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (resp?.ok) {
      // Optionally persist "remember me" using cookies/localStorage
      if (data.remember) {
        localStorage.setItem("rememberEmail", data.email);
      } else {
        localStorage.removeItem("rememberEmail");
      }
      void router.push("/dashboard");
    } else {
      if (resp?.error) setServerError(resp.error);
    }

    setIsPending(false);
  };

  if (status === "loading" || session?.user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your email below to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      {/* <Link
                        href="/forgot-password"
                        className="text-sm underline"
                      >
                        Forgot your password?
                      </Link> */}
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="remember-me"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="remember-me"
                      className="mt-0.5"
                      style={{ marginTop: "2px" }}
                    >
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />

              {serverError && (
                <p className="text-center text-sm text-red-500">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="grid gap-4">
              <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  console.log("google login",env.NEXT_PUBLIC_NEXTAUTH_URL);
                  await signIn("google", {
                    
                    callbackUrl: env.NEXT_PUBLIC_NEXTAUTH_URL+"/dashboard",
                  });
                }}
              >
                <ChromeIcon className="mr-2 h-4 w-4" />
                Google
              </Button>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="underline">
                  Sign Up
                </Link>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
