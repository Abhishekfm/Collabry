"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  UserIcon,
  FlagIcon,
  ClockIcon,
  CheckCircleIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { Priority, TaskStatus } from "@prisma/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// Mock data for demonstration purposes
interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  assigneeId?: string;
  creator: User;
  assignee?: User;
}

const mockUsers: User[] = [
  {
    id: "user1",
    name: "Alice Smith",
    avatarUrl: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "user2",
    name: "Bob Johnson",
    avatarUrl: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "user3",
    name: "Charlie Brown",
    avatarUrl: "/placeholder.svg?height=32&width=32",
  },
];

const taskStatuses = Object.values(TaskStatus);
const priorities = Object.values(Priority);

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task; // In a real app, you might fetch this by taskId
}

export function TaskDetailsModal({
  isOpen,
  onClose,
  task,
}: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(
    task.assigneeId,
  );

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setAssigneeId(task.assigneeId);
    }
  }, [task]);

  //   const handleSave = () => {
  //     // In a real application, you would send this data to your backend
  //     const updatedTask = {
  //       ...task,
  //       title,
  //       description,
  //       status,
  //       priority,
  //       dueDate,
  //       assigneeId,
  //     };
  //     console.log("Saving task:", updatedTask);
  //     setIsEditing(false);
  //     onClose(); // Close modal after saving
  //   };

  //   const handleDelete = () => {
  //     // In a real application, you would send a delete request to your backend
  //     console.log("Deleting task:", task.id);
  //     onClose(); // Close modal after deleting
  //   };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-gray-200 text-gray-800";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case TaskStatus.DONE:
        return "bg-green-100 text-green-800";
      case TaskStatus.REVIEW:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case Priority.LOW:
        return "bg-green-100 text-green-800";
      case Priority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case Priority.HIGH:
        return "bg-red-100 text-red-700";
      case Priority.URGENT:
        return "bg-red-100 text-red-900";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        console.log("closeee");
        onClose();
      }}
    >
      <DialogContent className="p-6 sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-none text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              ) : (
                title
              )}
            </DialogTitle>
            {/* {!isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <EditIcon className="h-5 w-5" />
                <span className="sr-only">Edit Task</span>
              </Button>
            )} */}
          </div>
          {/* <DialogDescription className="sr-only">
            View and edit task details.
          </DialogDescription> */}
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description
            </Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm text-gray-600">
                {description || "No description provided."}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label
                htmlFor="status"
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <CheckCircleIcon className="h-4 w-4 text-gray-500" /> Status
              </Label>

              <Badge className={cn("w-fit", getStatusColor(status))}>
                {status.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="priority"
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <FlagIcon className="h-4 w-4 text-gray-500" /> Priority
              </Label>

              <Badge className={cn("w-fit", getPriorityColor(priority))}>
                {priority}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label
                htmlFor="dueDate"
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" /> Due Date
              </Label>

              <p className="text-sm text-gray-600">
                {dueDate ? format(dueDate, "PPP") : "No due date"}
              </p>
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="assignee"
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <UserIcon className="h-4 w-4 text-gray-500" /> Assignee
              </Label>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                {task.assignee ? (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={task.assignee.avatarUrl ?? "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {task.assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {task.assignee.name}
                  </>
                ) : (
                  "Unassigned"
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              {/* <span>Created by: {task.creator.name}</span> */}
              <Tooltip>
                <TooltipTrigger>
                  <span>Created by: {task.creator.name}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{task.creator.email}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span>Created at: {format(task.createdAt, "PPP p")}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span>Last updated: {format(task.updatedAt, "PPP p")}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          {/* <Button
            variant="destructive"
            onClick={handleDelete}
            className="mt-2 w-full sm:mt-0 sm:w-auto"
          >
            <Trash2Icon className="mr-2 h-4 w-4" /> Delete
          </Button> */}
          {/* <div className="flex w-full gap-2 sm:w-auto">
            {isEditing && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset state if editing is cancelled
                  setTitle(task.title);
                  setDescription(task.description ?? "");
                  setStatus(task.status);
                  setPriority(task.priority);
                  setDueDate(task.dueDate);
                  setAssigneeId(task.assigneeId);
                }}
                className="w-full sm:w-auto"
              >
                <XCircleIcon className="mr-2 h-4 w-4" /> Cancel
              </Button>
            )}
            {isEditing ? (
              <Button onClick={handleSave} className="w-full sm:w-auto">
                <SaveIcon className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto"
              >
                <EditIcon className="mr-2 h-4 w-4" /> Edit Task
              </Button>
            )}
          </div> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
