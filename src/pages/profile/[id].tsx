"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  User,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Header } from "~/components/header";
import { TaskCard } from "~/components/task-card";
import { ProjectCard } from "~/components/project-card";
import Link from "next/link";

// Mock user data - in real app, this would come from tRPC
const mockUser = {
  id: "user_123",
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  image: "/placeholder.svg?height=120&width=120",
  bio: "Senior Product Designer with 5+ years of experience in creating user-centered digital experiences. Passionate about design systems and accessibility.",
  role: "ADMIN" as const,
  createdAt: new Date("2023-06-15"),
  updatedAt: new Date("2024-01-15"),
  isCurrentUser: false, // Set to true if viewing own profile
};

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
];

const mockTasks = [
  {
    id: "1",
    title: "Design homepage mockup",
    description:
      "Create wireframes and high-fidelity mockups for the new homepage",
    priority: "high" as const,
    status: "in-progress" as const,
    assignee: {
      id: "user_123",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=24&width=24",
    },
    creator: { id: "user_456", name: "John Doe" },
    dueDate: new Date("2024-01-20"),
    tags: ["design", "ui"],
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "User research analysis",
    description: "Analyze user feedback and create insights report",
    priority: "medium" as const,
    status: "review" as const,
    assignee: {
      id: "user_123",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=24&width=24",
    },
    creator: { id: "user_123", name: "Sarah Johnson" },
    dueDate: new Date("2024-01-18"),
    tags: ["research", "analysis"],
    createdAt: new Date("2024-01-12"),
  },
];

const mockStats = {
  totalProjects: 8,
  activeProjects: 3,
  completedTasks: 47,
  totalTasks: 52,
};

const roleColors = {
  ADMIN: "bg-red-100 text-red-800",
  MEMBER: "bg-blue-100 text-blue-800",
};

export default function ProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="mb-4 h-32 w-32">
                  <AvatarImage
                    src={mockUser.image || "/placeholder.svg"}
                    alt={mockUser.name || "User"}
                  />
                  <AvatarFallback className="text-2xl">
                    {mockUser.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    {mockUser.name}
                  </h1>
                  <div className="mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{mockUser.email}</span>
                  </div>
                  <Badge className={roleColors[mockUser.role]}>
                    {mockUser.role}
                  </Badge>
                </div>
              </div>

              {/* Bio and Actions */}
              <div className="flex-1">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    {mockUser.bio && (
                      <div className="mb-4">
                        <h3 className="mb-2 font-semibold text-gray-900">
                          About
                        </h3>
                        <p className="leading-relaxed text-gray-600">
                          {mockUser.bio}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Joined {mockUser.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>
                          Last active {mockUser.updatedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {!mockUser.isCurrentUser && (
                      <>
                        <Button variant="outline">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              View Projects Together
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              View Shared Tasks
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Report User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                    {mockUser.isCurrentUser && (
                      <Link href="/settings/profile">
                        <Button>Edit Profile</Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {mockStats.totalProjects}
                    </div>
                    <div className="text-sm text-gray-600">Total Projects</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {mockStats.activeProjects}
                    </div>
                    <div className="text-sm text-gray-600">Active Projects</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {mockStats.completedTasks}
                    </div>
                    <div className="text-sm text-gray-600">Completed Tasks</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {mockStats.totalTasks}
                    </div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Recent Projects */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">
                    Recent Projects
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockProjects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                    >
                      <div
                        className={`h-3 w-3 rounded-full ${project.color}`}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {project.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {project.description}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {project.isCreator ? "Owner" : "Member"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Recent Tasks</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="line-clamp-1 font-medium text-gray-900">
                          {task.title}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={
                            task.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {/* <span>Due: {task.dueDate.toLocaleDateString()}</span> */}
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode="grid"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent> */}
        </Tabs>
      </main>
    </div>
  );
}
