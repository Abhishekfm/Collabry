"use client";

import { useState } from "react";
import { Calendar, Flag, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export interface TaskInfo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  assignee: { id: string; name: string; avatar: string; email: string };
  creator: { id: string; name: string; email?: string };
  dueDate: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TaskCardProps {
  projectId: string;
  task: TaskInfo;
  projectMembers: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  }>;
}

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-700",
  URGENT: "bg-red-100 text-red-900",
};

const priorityIcons = {
  low: "🟢",
  medium: "🟡",
  high: "🔴",
};

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isBefore,
} from "date-fns";
import { type Priority, TaskStatus } from "@prisma/client";
import { CreateTaskModal } from "./create-task-modal";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { TaskDetailsModal } from "./task-details-modal";
import { useSession } from "next-auth/react";

export function getTimeLeftString(deadline: Date): string {
  const now = new Date();

  if (isBefore(deadline, now)) return "Expired";

  const days = differenceInDays(deadline, now);
  const hours = differenceInHours(deadline, now) % 24;
  const minutes = differenceInMinutes(deadline, now) % 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || (!days && !hours)) parts.push(`${minutes}m`);

  return parts.join(" ") + " left";
}

export function TaskCard({ task, projectId, projectMembers }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const session = useSession();

  const isOverdue =
    task.dueDate < new Date() && task.status !== TaskStatus.DONE;
  const isDueSoon =
    task.dueDate <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) &&
    task.status !== TaskStatus.DONE;

  const utils = api.useUtils();

  const deleteTaskApi = api.projectTasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Task Deleted!");
      void utils.project.getById.invalidate();
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  const deleteTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // try {
    deleteTaskApi.mutate({
      id: task.id,
    });
    // optional: show success message or refetch data
    // } catch (error) {
    //   console.error("Failed to delete task:", error);
    //   // optional: show error toast/snackbar
    // }
  };

  return (
    <Card
      className="abhishek group cursor-pointer transition-all duration-200 hover:shadow-md"
      // onMouseDown={() => {
      //   if (isModalOpen) {
      //     setIsModalOpen(false);
      //   } else {
      //     setIsModalOpen(true);
      //   }
      //   console.log("clicked");
      // }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h4 className="line-clamp-2 flex-1 pr-2 font-medium text-gray-900">
              {task.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`opacity-0 transition-opacity group-hover:opacity-100 ${isHovered ? "opacity-100" : ""}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                >
                  View Details
                </DropdownMenuItem>
                {(task.creator.id === session.data?.user.id ||
                  task.assignee.id === session.data?.user.id) && (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCreateTask(true);
                      }}
                    >
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {task.creator.id === session.data?.user.id && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={deleteTask}
                      >
                        Delete Task
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {task.description && (
            <p className="line-clamp-2 text-sm text-gray-600">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Priority */}
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={priorityColors[task.priority]}
            >
              <Flag className="mr-1 h-3 w-3" />
              {task.priority}
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={task.assignee.avatar || "/placeholder.svg"}
                  alt={task.assignee.name}
                />
                <AvatarFallback className="text-xs">
                  {task.assignee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500">
                {task.assignee.name}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span
                className={
                  isOverdue
                    ? "font-medium text-red-600"
                    : isDueSoon
                      ? "font-medium text-yellow-600"
                      : ""
                }
              >
                {/* task.dueDate.toLocaleDateString()  */}
                {getTimeLeftString(task.dueDate)}
              </span>
            </div>
          </div>
        </div>
        <CreateTaskModal
          open={showCreateTask}
          onOpenChange={setShowCreateTask}
          projectId={projectId}
          projectMembers={projectMembers}
          taskInfo={task}
        />
        <TaskDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={task}
        />
      </CardContent>
    </Card>
  );
}
