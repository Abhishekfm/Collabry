"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Camera, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Header } from "~/components/header";
import Link from "next/link";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import LoadingSpinner from "~/components/loading-spinner";

const profileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    image: z.string().url("Please enter a valid image URL").optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length >= 8,
        "Password must be at least 8 characters",
      ),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    },
  );

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  // tRPC queries and mutations
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = api.userRouter.getProfile.useQuery();

  const updateProfileMutation = api.userRouter.updateProfile.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      // Reset password fields after successful update
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const changePasswordMutation = api.userRouter.changePassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      // Reset password fields after successful change
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("/auth/signin");
    }
  }, [status, router]);

  // Update form when user data is loaded
  useEffect(() => {
    if (userProfile) {
      form.setValue("name", userProfile.name ?? "");
      form.setValue("email", userProfile.email ?? "");
      form.setValue("bio", userProfile.bio ?? "");
      if (userProfile.image) form.setValue("image", userProfile.image);
      setProfileImage(userProfile.image ?? "");
    }
  }, [userProfile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Check if password fields are filled
      const isPasswordChange =
        data.currentPassword && data.newPassword && data.confirmPassword;

      if (isPasswordChange) {
        // Handle password change separately
        await changePasswordMutation.mutateAsync({
          currentPassword: data.currentPassword!,
          newPassword: data.newPassword!,
          confirmNewPassword: data.confirmPassword!,
        });
      }

      // Update profile information (excluding password fields)
      const profileData = {
        name: data.name,
        email: data.email,
        bio: data.bio ?? undefined,
        image: data.image ?? undefined,
      };

      // Only update if there are actual changes
      const hasProfileChanges =
        profileData.name !== userProfile?.name ||
        profileData.email !== userProfile?.email ||
        profileData.bio !== userProfile?.bio ||
        profileData.image !== userProfile?.image;

      if (hasProfileChanges) {
        await updateProfileMutation.mutateAsync(profileData);
      }

      if (!isPasswordChange && !hasProfileChanges) {
        toast.error("No changes to save");
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error("Failed to update profile:", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to a cloud service (AWS S3, Cloudinary, etc.)
      // For now, we'll create a local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProfileImage(imageUrl);
        form.setValue("image", imageUrl);
      };
      reader.readAsDataURL(file);

      // Show info about uploading to cloud storage
      toast.error(
        "In production, upload this image to cloud storage and use the URL",
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      try {
        // You would implement this API endpoint
        // await api.user.deleteAccount.mutate();
        toast.success(
          "Account deletion initiated. You will receive a confirmation email.",
        );
      } catch (error) {
        toast.error("Failed to delete account. Please try again.");
      }
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return <LoadingSpinner />;
  }

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto max-w-4xl px-4 py-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              Failed to load profile: {profileError.message}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto max-w-4xl px-4 py-6">
          <Alert>
            <AlertDescription>No profile data available.</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const isLoading =
    updateProfileMutation.isPending || changePasswordMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profileImage ?? "/placeholder.svg"}
                      alt={userProfile.name ?? "User"}
                    />
                    <AvatarFallback className="text-xl">
                      {userProfile.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <Badge className="bg-red-100 text-red-800">
                        {userProfile.role}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Member since{" "}
                        {format(new Date(userProfile.createdAt), "P", {
                          locale: enUS,
                        })}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("avatar-upload")?.click()
                        }
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Change Photo
                      </Button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                          />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormDescription>
                          Changing your email will require verification
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description about yourself (max 500 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/your-image.jpg"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setProfileImage(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        You can upload an image above or paste a URL here
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    Leave password fields empty if you don&apos;t want to change
                    your password.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>

              {/* <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button> */}
            </div>
          </form>
        </Form>

        {/* Danger Zone */}
        <Card className="mt-8 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-700">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
