"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { type Priority, TaskStatus } from "@prisma/client"; // Adjust import path as needed
import toast from "react-hot-toast";
import { type AppRouter } from "~/server/api/root";
import { type inferRouterOutputs } from "@trpc/server";
import LoadingSpinner from "./loading-spinner";

type RouterOutput = inferRouterOutputs<AppRouter>;
type ProjectFromApi = RouterOutput["project"]["getById"];

// Define the task structure based on your schema
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  assigneeId: string | null;
  creatorId: string;
  projectId: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  assignee?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  creator: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  tags?: string[]; // If you have tags in your schema
}

interface TasksByStatus {
  [TaskStatus.TODO]: Task[];
  [TaskStatus.IN_PROGRESS]: Task[];
  [TaskStatus.REVIEW]: Task[];
  [TaskStatus.DONE]: Task[];
}

const columns = [
  { id: TaskStatus.TODO, title: "To Do", color: "bg-gray-100" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress", color: "bg-blue-100" },
  { id: TaskStatus.REVIEW, title: "Review", color: "bg-yellow-100" },
  { id: TaskStatus.DONE, title: "Done", color: "bg-green-100" },
];

interface TaskBoardProps {
  projectId: string;
  project?: ProjectFromApi;
  refetchProject: () => void;
  projectLoading: boolean;
}

export function TaskBoard({
  projectId,
  project,
  refetchProject,
  projectLoading,
}: TaskBoardProps) {
  const [tasks, setTasks] = useState<TasksByStatus>({
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.REVIEW]: [],
    [TaskStatus.DONE]: [],
  });

  // Fetch project data including tasks
  // const {
  //   data: project,
  //   isLoading: projectLoading,
  //   refetch: refetchProject,
  // } = api.project.getById.useQuery({ id: projectId });

  // Mutation for updating task status
  const updateTaskStatus = api.projectTasks.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Task status updated");
      void refetchProject(); // Refetch to get updated data
    },
    onError: (error) => {
      toast.error("Failed to update task status");
      console.error("Task update error:", error);
      // Revert the optimistic update
      if (project?.tasks) {
        organizeTasksByStatus(project.tasks as Task[]);
      }
    },
  });

  // Function to organize tasks by status
  const organizeTasksByStatus = (tasksArray: Task[]) => {
    const organized: TasksByStatus = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    tasksArray.forEach((task) => {
      if (organized[task.status]) {
        organized[task.status].push(task);
      }
    });

    setTasks(organized);
  };

  // Update tasks when project data changes
  useEffect(() => {
    if (project?.tasks) {
      organizeTasksByStatus(project.tasks as Task[]);
    }
  }, [project]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Type guard to ensure droppableId is a valid TaskStatus
    const isValidTaskStatus = (status: string): status is TaskStatus => {
      return Object.values(TaskStatus).includes(status as TaskStatus);
    };

    if (
      !isValidTaskStatus(source.droppableId) ||
      !isValidTaskStatus(destination.droppableId)
    ) {
      console.error("Invalid task status in drag and drop");
      return;
    }

    // Find the dragged task
    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];
    const draggedTask = sourceColumn.find((task) => task.id === draggableId);

    if (!draggedTask) return;

    // Optimistic update - update UI immediately
    const newSourceTasks = sourceColumn.filter(
      (task) => task.id !== draggableId,
    );

    const newDestTasks = [...destColumn];
    const updatedTask = {
      ...draggedTask,
      status: destination.droppableId,
    };
    newDestTasks.splice(destination.index, 0, updatedTask);

    setTasks({
      ...tasks,
      [source.droppableId]: newSourceTasks,
      [destination.droppableId]: newDestTasks,
    });

    // Update task status in database
    updateTaskStatus.mutate({
      id: draggableId,
      status: destination.droppableId,
    });
  };

  if (projectLoading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">Project not found</div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-500">
                  {tasks[column.id].length}
                </span>
              </div>
              <Button variant="ghost" size="sm" disabled={true}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Droppable
              droppableId={column.id}
              isDropDisabled={updateTaskStatus.isPending}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] space-y-3 transition-colors ${
                    snapshot.isDraggingOver ? "rounded-lg bg-gray-50" : ""
                  }`}
                >
                  {tasks[column.id].map((task, index) => {
                    return (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition-transform ${
                              snapshot.isDragging ? "rotate-2 scale-105" : ""
                            }`}
                          >
                            <TaskCard
                              projectCreatorId={project.creatorId}
                              projectId={projectId}
                              projectMembers={project.members.map((member) => {
                                return {
                                  id: member.user.id,
                                  name: member.user.name ?? "",
                                  email: member.user.email ?? "",
                                  avatar:
                                    member.user.image ??
                                    "/placeholder.svg?height=24&width=24",
                                  role: member.role,
                                };
                              })}
                              task={{
                                ...task,
                                // Transform the data to match TaskCard expectations
                                priority: task.priority,
                                status: task.status,
                                createdAt: task.createdAt,
                                updatedAt: task.updatedAt,
                                assignee: task.assignee
                                  ? {
                                      id: task.assignee.id,
                                      name: task.assignee.name ?? "Unknown",
                                      email: task.assignee.email ?? "unknown",
                                      avatar:
                                        task.assignee.image ??
                                        "/placeholder.svg?height=24&width=24",
                                    }
                                  : {
                                      id: "Admin",
                                      name: "Unknown",
                                      email: "unknown",
                                      avatar:
                                        "/placeholder.svg?height=24&width=24",
                                    },
                                creator: {
                                  id: task?.creator?.id,
                                  name: task?.creator?.name ?? "Unknown",
                                  email: task.creator.email ?? undefined,
                                },
                                tags: task.tags ?? [],
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
