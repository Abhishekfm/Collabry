"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Users,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { CreateProjectModal } from "./create-project-modal";

type RouterOutput = inferRouterOutputs<AppRouter>;
type ProjectFromApi = RouterOutput["project"]["getAll"][number];

interface ProjectCardProps {
  project: ProjectFromApi;
  viewMode: "grid" | "list";
  updateList?: () => void;
}

export function ProjectCard({
  project,
  viewMode,
  updateList,
}: ProjectCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectUpdated, setProjectUpdated] = useState(false);

  const progress =
    project?.totalTask > 0
      ? (project.completedTask / project.totalTask) * 100
      : 0;
  const isCompleted = progress === 100;

  const handleCardClick = () => {
    router.push(`/project/${project?.id}`);
  };

  const projectDeleteApi = api.project.delete.useMutation({
    onSuccess: () => {
      toast.success("Project Deleted");
      updateList?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProject = () => {
    projectDeleteApi.mutate({
      id: project.id,
    });
  };

  const handleEditProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCreateModal(true);
  };

  const renderDropdownMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className={
            viewMode === "grid"
              ? "opacity-0 transition-opacity group-hover:opacity-100"
              : ""
          }
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>View Details</DropdownMenuItem>
        {project.isCreator && (
          <>
            <DropdownMenuItem onClick={handleEditProject}>
              Edit Project
            </DropdownMenuItem>
            {/* <DropdownMenuItem>Manage Members</DropdownMenuItem> */}
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                deleteProject();
              }}
            >
              Delete Project
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const listView = (
    <Card
      className="cursor-pointer border-l-4 transition-all duration-200 hover:shadow-md"
      style={{
        borderLeftColor: project?.color?.replace("bg-", "#") ?? "green-500",
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              {isCompleted && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Completed
                </Badge>
              )}
              {project.isCreator && <Badge variant="outline">Owner</Badge>}
            </div>
            <p className="mb-3 text-sm text-gray-600">{project.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{project?.members?.length} members</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>
                  {project.completedTask}/{project.totalTask} tasks
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Updated {project.updatedAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24">
              <Progress value={progress} className="h-2" />
            </div>
            {renderDropdownMenu()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const gridView = (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div
            className={`h-3 w-3 rounded-full ${project?.color ?? "bg-green-500"} transition-all duration-200 ${isHovered ? "scale-125" : ""}`}
          />
          {renderDropdownMenu()}
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-gray-900">{project.name}</h3>
          <p className="line-clamp-2 text-sm text-gray-600">
            {project.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{project?.members?.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>
                {project.completedTask}/{project.totalTask}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{project.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Completed
              </Badge>
            )}
            {project.isCreator && <Badge variant="outline">Owner</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {viewMode === "list" ? listView : gridView}

      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setProjectUpdated(true);
          updateList?.(); // Also call updateList to refresh the parent component
        }}
        projectInfo={
          project
            ? {
                id: project.id,
                name: project.name,
                description: project?.description,
                color: project?.color,
                members: project.members
                  .map((member) => member.userEmail)
                  .filter((email): email is string => email !== null),
              }
            : undefined
        }
      />
    </>
  );
}
