"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { env } from "~/env";

import { api } from "~/utils/api"; // <-- your trpc/api hook
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
import { ChromeIcon } from "lucide-react";
import LoadingSpinner from "~/components/loading-spinner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form"; // assuming you're using shadcn/ui
import Head from "next/head";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [serverError, setServerError] = useState("");

  const form = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  const signup = api.auth.signup.useMutation({
    onSuccess: () => {
      void router.push("/auth/signin");
    },
    onError: (error) => {
      setServerError(error.message || "Something went wrong");
    },
  });

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user) {
      void router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading" || session?.user) {
    return <LoadingSpinner />; // or a loading spinner
  }

  const onSubmit = (data: SignUpData) => {
    setServerError("");
    signup.mutate(data);
  };

  return (
    <>
      <Head>
        <title>Sign Up | Collabry</title>
        <meta
          name="Sign Up"
          content="Manage your tasks and team with Collabry."
        />
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serverError && (
                  <p className="text-center text-sm text-red-500">
                    {serverError}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={signup.isPending}
                >
                  {signup.isPending ? "Signing up..." : "Sign Up"}
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
                    await signIn("google", {
                      callbackUrl: env.NEXT_PUBLIC_NEXTAUTH_URL + "/dashboard",
                    });
                  }}
                >
                  <ChromeIcon className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="underline">
                    Sign In
                  </Link>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
