import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
// import { Metadata } from "next";
import Head from "next/head";
import { Header } from "~/components/header";
import { Button } from "~/components/ui/button";
import { Filter, Grid, List, Plus, Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { ProjectCard } from "~/components/project-card";
import { CreateProjectModal } from "~/components/create-project-modal";
import { api } from "~/utils/api";
import LoadingSpinner from "~/components/loading-spinner";

// export const metadata: Metadata = {
//   title: "Dashboard | Collabry",
//   description: "Manage your tasks and team with Collabry's dashboard.",
// };

// Mock data - in real app, this would come from tRPC
const mockProjects = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    memberCount: 5,
    taskCount: 12,
    completedTasks: 8,
    color: "bg-blue-500",
    isCreator: true,
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Mobile App",
    description: "iOS and Android app development",
    memberCount: 3,
    taskCount: 24,
    completedTasks: 6,
    color: "bg-green-500",
    isCreator: false,
    updatedAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    name: "Marketing Campaign",
    description: "Q1 2024 marketing initiatives",
    memberCount: 4,
    taskCount: 8,
    completedTasks: 8,
    color: "bg-purple-500",
    isCreator: true,
    updatedAt: new Date("2024-01-13"),
  },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectUpdated, setProjectUpdated] = useState(false);

  const {
    data: allProjects,
    refetch,
    isLoading,
  } = api.project.getAll.useQuery();

  console.log("getAllProjects", allProjects);

  useEffect(() => {
    if (projectUpdated) {
      void refetch();
      setProjectUpdated(false);
    }
  }, [projectUpdated, refetch]);

  // const filteredProjects = mockProjects.filter(
  //   (project) =>
  //     project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  // );

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Head>
        <title>Dashboard | Collabry</title>
        <meta
          name="description"
          content="Manage your tasks and team with Collabry's dashboard."
        />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Collaborative Projects
                </h1>
                <p className="mt-1 text-gray-600">
                  Manage and track all your collaborative work
                </p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 transition-colors hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {!allProjects || allProjects?.length === 0 ? (
            isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No projects found
                </h3>
                <p className="mb-4 text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first project"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                )}
              </div>
            )
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-4"
              }
            >
              {allProjects?.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                  updateList={() => {
                    setProjectUpdated(true);
                  }}
                />
              ))}
            </div>
          )}
        </main>

        <CreateProjectModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={() => {
            setProjectUpdated(true);
          }}
        />
      </div>
    </>
  );
}
