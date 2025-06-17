"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Flag, User, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Calendar as CalendarComponent } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { Priority } from "@prisma/client";
import { type TaskInfo } from "./task-card";

const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  priority: z.nativeEnum(Priority),
  assigneeId: z.string().min(1, "Please assign the task."),
  dueDate: z.date().min(new Date(), "Please Enter valid date."),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectMembers?: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
  }>;
  taskInfo?: TaskInfo;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  projectId,
  projectMembers,
  taskInfo,
}: CreateTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: Priority.MEDIUM,
      assigneeId: "",
    },
  });

  const isEditing = !!taskInfo;

  useEffect(() => {
    if (open) {
      if (taskInfo) {
        // Editing mode - populate form with existing data

        form.reset({
          title: taskInfo.title,
          description: taskInfo.description ?? "",
          priority: taskInfo.priority,
          assigneeId: taskInfo.assignee.id,
          dueDate: taskInfo.dueDate,
        });
      } else {
        // Creating mode - reset to defaults
        form.reset({
          title: "",
          description: "",
          priority: Priority.MEDIUM,
          assigneeId: "",
        });
      }
    }
  }, [open, taskInfo]); //form

  const utils = api.useUtils();

  const createTaskApi = api.projectTasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task Created Successfully!");
      onOpenChange(false);
      // utils.invalidate
      void utils.project.getById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateTaskApi = api.projectTasks.update.useMutation({
    onSuccess: () => {
      toast.success("Task Updated Successfully!");
      onOpenChange(false);

      void utils.project.getById.invalidate();
      // updateList();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    try {
      // In real app: await api.task.create.mutate({ ...data, projectId })

      if (isEditing && taskInfo) {
        // Update existing project
        await updateTaskApi.mutateAsync({ ...data, id: taskInfo.id });
      } else {
        // Create new project
        await createTaskApi.mutateAsync({ ...data, projectId });
      }

      onOpenChange(false);
      form.reset();

      // Simulate API call
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {taskInfo ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              //   control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What needs to be done?"
                      {...field}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              //   control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details about this task..."
                      className="resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Priority
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Priority.LOW}>🟢 Low</SelectItem>
                        <SelectItem value={Priority.MEDIUM}>
                          🟡 Medium
                        </SelectItem>
                        <SelectItem value={Priority.HIGH}>🔴 High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Assignee
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {projectMembers?.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={member.avatar || "/placeholder.svg"}
                                  alt={member.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date (Optional)
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP p") // date + time using date-fns
                          ) : (
                            <span>Pick a date & time</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto space-y-2 p-4"
                      align="start"
                    >
                      {/* Calendar for picking the date */}
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (!date) return;
                          const existing = field.value ?? new Date();
                          const newDate = new Date(date);
                          newDate.setHours(
                            existing.getHours(),
                            existing.getMinutes(),
                          );
                          field.onChange(newDate);
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />

                      {/* Native time input */}
                      <input
                        type="time"
                        className="w-full rounded border px-2 py-1"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value
                            .split(":")
                            .map(Number);
                          const updated = field.value
                            ? new Date(field.value)
                            : new Date();
                          updated.setHours(hours!, minutes);
                          updated.setSeconds(0); // optional
                          field.onChange(updated);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
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
                className="bg-blue-600 transition-colors hover:bg-blue-700"
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
