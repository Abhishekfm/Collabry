// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// // import Dashboard from '../dashboard' // adjust path if needed
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";
// import { CreateProjectModal } from "~/components/create-project-modal";
// import Dashboard from "~/pages/dashboard";

// // Minimal mock projects data
// const mockProjects = [
//   {
//     id: "1",
//     name: "Website Redesign",
//     description: "Complete overhaul of company website",
//     memberCount: 5,
//     taskCount: 12,
//     completedTasks: 8,
//     color: "bg-blue-500",
//     isCreator: true,
//     updatedAt: new Date("2024-01-15"),
//   },
// ];

// // ✅ Local mocks instead of global jest.setup
// jest.mock("next/router", () => ({
//   useRouter: jest.fn(),
// }));
// jest.mock("next-auth/react", () => ({
//   useSession: jest.fn(),
// }));
// jest.mock("~/utils/api", () => ({
//   api: {
//     project: {
//       getAll: {
//         useQuery: () => ({
//           data: mockProjects,
//           refetch: jest.fn(),
//           isLoading: false,
//           error: null,
//         }),
//       },
//     },
//   },
// }));

// // Optionally mock lucide icons and other UI components
// jest.mock("lucide-react", () => ({
//   Plus: () => <div data-testid="plus-icon" />,
//   Grid: () => <div data-testid="grid-icon" />,
//   List: () => <div data-testid="list-icon" />,
//   Filter: () => <div data-testid="filter-icon" />,
// }));

// jest.mock("~/components/header", () => ({
//   Header: () => <div data-testid="header">Header</div>,
// }));

// describe("Dashboard UI", () => {
//   const mockPush = jest.fn();

//   beforeEach(() => {
//     jest.clearAllMocks();
//     (useRouter as jest.Mock).mockReturnValue({
//       push: mockPush,
//       pathname: "/dashboard",
//       query: {},
//       asPath: "/dashboard",
//     });
//   });

//   it("redirects if unauthenticated", async () => {
//     (useSession as jest.Mock).mockReturnValue({
//       data: null,
//       status: "unauthenticated",
//     });

//     render(<Dashboard />);

//     await waitFor(() => {
//       expect(mockPush).toHaveBeenCalledWith("/auth/signin");
//     });
//   });

//   it("shows loading if session is loading", () => {
//     (useSession as jest.Mock).mockReturnValue({
//       data: null,
//       status: "loading",
//     });

//     render(<CreateProjectModal />);
//     expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
//   });

//   it("renders dashboard content for authenticated user", () => {
//     (useSession as jest.Mock).mockReturnValue({
//       data: { user: { id: "1", email: "test@example.com" } },
//       status: "authenticated",
//     });

//     render(<Dashboard />);

//     expect(screen.getByText("Collaborative Projects")).toBeInTheDocument();
//     expect(screen.getByTestId("project-card-1")).toBeInTheDocument();
//     expect(
//       screen.getByRole("button", { name: /new project/i }),
//     ).toBeInTheDocument();
//   });
// });
