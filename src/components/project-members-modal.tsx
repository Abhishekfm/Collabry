"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Mail, Crown, User, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { ProjectRole } from "@prisma/client";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface ProjectMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectMembers?: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  }>;
  isCreator?: boolean;
  updateList: () => void;
}

export function ProjectMembersModal({
  open,
  onOpenChange,
  projectId,
  projectMembers,
  isCreator = false,
  updateList,
}: ProjectMembersModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
    },
  });

  const addMemberApi = api.project.addMember.useMutation({
    onSuccess: () => {
      toast.success("Member Added!");
      onOpenChange(false);
      updateList();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMemberApi = api.project.removeMember.useMutation({
    onSuccess: () => {
      toast.success("Member Removed!");
      onOpenChange(false);
      updateList();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setIsLoading(true);
    try {
      // In real app: await api.project.addMember.mutate({ projectId: project.id, email: data.email })

      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      addMemberApi.mutate({
        projectId,
        email: data?.email,
      });

      form.reset();
      setShowInviteForm(false);
    } catch (error) {
      console.error("Failed to invite member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (email: string) => {
    try {
      // In real app: await api.project.removeMember.mutate({ projectId: project.id, memberId })
      removeMemberApi.mutate({
        projectId,
        email,
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Project Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Members ({projectMembers?.length})
              </h4>
              {isCreator && (
                <Button
                  size="sm"
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite
                </Button>
              )}
            </div>

            <div className="behavio max max-h-60 scroll-m-0 space-y-3 overflow-y-auto">
              {projectMembers?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.avatar || "/placeholder.svg"}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {member.name}
                        </p>
                        {member.role === ProjectRole.OWNER && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            <Crown className="mr-1 h-3 w-3" />
                            Owner
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>

                  {isCreator && member.role !== "Creator" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => removeMember(member.email)}
                        >
                          Remove from Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Invite Form */}
          {showInviteForm && isCreator && (
            <div className="border-t pt-6">
              <h4 className="mb-4 flex items-center gap-2 font-medium text-gray-900">
                <Mail className="h-4 w-4" />
                Add New Member
              </h4>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter email address..."
                            {...field}
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowInviteForm(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 transition-colors hover:bg-blue-700"
                    >
                      {isLoading ? "Sending..." : "Send Invite"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
