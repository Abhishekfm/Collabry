"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Palette, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
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

const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  color: z.string().min(1, "Please select a color").optional(),
  members: z.array(z.string().email()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const colors = [
  { name: "Blue", value: "bg-blue-500", hex: "#3B82F6" },
  { name: "Green", value: "bg-green-500", hex: "#10B981" },
  { name: "Purple", value: "bg-purple-500", hex: "#8B5CF6" },
  { name: "Red", value: "bg-red-500", hex: "#EF4444" },
  { name: "Yellow", value: "bg-yellow-500", hex: "#F59E0B" },
  { name: "Pink", value: "bg-pink-500", hex: "#EC4899" },
  { name: "Indigo", value: "bg-indigo-500", hex: "#6366F1" },
  { name: "Teal", value: "bg-teal-500", hex: "#14B8A6" },
];

export interface ProjectInfo {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  members?: string[];
}

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projectInfo?: ProjectInfo; // Optional - if provided, we're editing
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSuccess,
  projectInfo,
}: CreateProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  const isEditing = !!projectInfo;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      color: colors[0]?.value,
      members: [],
    },
  });

  // Reset form and state when modal opens/closes or projectInfo changes
  useEffect(() => {
    if (open) {
      if (projectInfo) {
        // Editing mode - populate form with existing data

        form.reset({
          name: projectInfo.name,
          description: projectInfo.description ?? "",
          color: projectInfo?.color ?? "",
          members: projectInfo.members ?? [],
        });
        setMembers(projectInfo.members ?? []);
      } else {
        // Creating mode - reset to defaults
        form.reset({
          name: "",
          description: "",
          color: colors[0]?.value,
          members: [],
        });
        setMembers([]);
      }
      setMemberInput("");
    }
  }, [open, projectInfo]); //form

  const projectCreate = api.project.create.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully!");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to create project!");
    },
  });

  const projectUpdate = api.project.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully!");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to update project!");
    },
  });

  const addMember = () => {
    const email = memberInput.trim();
    if (email && !members.includes(email)) {
      if (z.string().email().safeParse(email).success) {
        const updatedMembers = [...members, email];
        setMembers(updatedMembers);
        setMemberInput("");
        form.setValue("members", updatedMembers);
      }
    }
  };

  const removeMember = (emailToRemove: string) => {
    const updatedMembers = members.filter((email) => email !== emailToRemove);
    setMembers(updatedMembers);
    form.setValue("members", updatedMembers);
  };

  const handleMemberInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMember();
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && projectInfo) {
        // Update existing project
        await projectUpdate.mutateAsync({ id: projectInfo.id, ...data });
      } else {
        // Create new project
        await projectCreate.mutateAsync(data);
      }

      onOpenChange(false);
      form.reset();
      setMembers([]);
      setMemberInput("");
    } catch (error) {
      console.error(
        `Failed to ${isEditing ? "update" : "create"} project:`,
        error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project name..."
                      {...field}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's this project about?"
                      className="resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="members"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Members (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {/* Member Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter email address..."
                          value={memberInput}
                          onChange={(e) => setMemberInput(e.target.value)}
                          onKeyDown={handleMemberInputKeyDown}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addMember}
                          variant="outline"
                          disabled={!memberInput.trim()}
                        >
                          Add
                        </Button>
                      </div>

                      {/* Added Members */}
                      {members.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            Added members:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {members.map((email) => (
                              <Badge
                                key={email}
                                variant={"secondary"}
                                className="flex items-center gap-1 pr-1"
                              >
                                <span>{email}</span>
                                <button
                                  type="button"
                                  onClick={() => removeMember(email)}
                                  className="ml-1 rounded-full p-0.5 transition-colors hover:bg-gray-300"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Helper Text */}
                      <div className="text-sm text-gray-500">
                        Press Enter to add members quickly, or use the Add
                        button
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Project Color
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-8 gap-3">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => field.onChange(color.value)}
                          className={`h-6 w-6 rounded-lg transition-all duration-200 hover:scale-110 ${
                            field.value === color.value
                              ? "ring-2 ring-gray-900 ring-offset-2"
                              : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={`${
                  isEditing
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } transition-colors`}
              >
                {isLoading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Project"
                    : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
