"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Users, Settings } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { TaskBoard } from "~/components/task-board";
import { CreateTaskModal } from "~/components/create-task-modal";
import { ProjectMembersModal } from "~/components/project-members-modal";
import { Header } from "~/components/header";
import Link from "next/link";
import { api } from "~/utils/api";
import { ProjectRole } from "@prisma/client";

// Mock data
const mockProject = {
  id: "1",
  name: "Website Redesign",
  description:
    "Complete overhaul of company website with modern design and improved UX",
  color: "bg-blue-500",
  isCreator: true,
  members: [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "Creator",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "Member",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "Member",
    },
  ],
};

export default function ProjectPage() {
  const params = useParams();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [listUpdated, setListUpdated] = useState(false);

  const {
    data: project,
    isLoading: projectLoading,
    refetch: refetchProject,
  } = api.project.getById.useQuery({ id: params?.slug as string });

  useEffect(() => {
    if (listUpdated) {
      void refetchProject();
      setListUpdated(false);
    }
  }, [listUpdated, refetchProject]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Project Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`h-4 w-4 rounded-full ${project?.color} mt-1`} />
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  {project?.name}
                </h1>
                <p className="mb-4 max-w-2xl text-gray-600">
                  {project?.description}
                </p>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-gray-200 font-[300]"
                  >
                    <Users className="h-3 w-3" />
                    {project?.members.length} members
                  </Badge>
                  {project?.isCreator && <Badge>Owner</Badge>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowMembers(true)}>
                <Users className="mr-2 h-4 w-4" />
                {project?.members.length} Members
              </Button>
              {project?.isCreator && (
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              )}
              <Button
                onClick={() => setShowCreateTask(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Task Board */}
        <TaskBoard
          projectId={params?.slug as string}
          project={project}
          refetchProject={refetchProject}
          projectLoading={projectLoading}
        />
      </main>

      <CreateTaskModal
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projectId={params?.slug as string}
        projectMembers={project?.members.map((member) => {
          return {
            id: member.user.id,
            name: member.user.name ?? "",
            email: member.user.email ?? "",
            avatar: member.user.image ?? "/placeholder.svg?height=24&width=24",
          };
        })}
        // updateList={() => {
        //   setListUpdated(true);
        // }}
      />

      <ProjectMembersModal
        open={showMembers}
        onOpenChange={setShowMembers}
        projectId={params?.slug as string}
        projectMembers={
          project
            ? [
                ...(project.members.map((member) => ({
                  id: member.user.id,
                  name: member.user.name ?? "",
                  email: member.user.email ?? "",
                  avatar:
                    member.user.image ?? "/placeholder.svg?height=24&width=24",
                  role: member.role,
                })) ?? []),
                {
                  id: project.creator.id,
                  name: project.creator.name ?? "",
                  email: project.creator.email ?? "",
                  avatar:
                    project.creator.image ??
                    "/placeholder.svg?height=24&width=24",
                  role: ProjectRole.OWNER,
                },
              ]
            : []
        }
        isCreator={project?.isCreator}
        updateList={() => {
          setListUpdated(true);
        }}
      />
    </div>
  );
}
