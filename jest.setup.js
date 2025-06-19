import "@testing-library/jest-dom";

// // Mock next/router
// jest.mock('next/router', () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//     pathname: '/dashboard',
//     query: {},
//     asPath: '/',
//   }),
// }))

// // Mock next-auth/react
// jest.mock('next-auth/react', () => ({
//   useSession: jest.fn(),
// }))

// // Mock next/head
// jest.mock('next/head', () => {
//   return function Head({ children }) {
//     return( <>{children}</>)
//   }
// })

// // Mock react-hot-toast
// jest.mock('react-hot-toast', () => ({
//   __esModule: true,
//   default: {
//     success: jest.fn(),
//     error: jest.fn(),
//   },
// }))

// // Mock tRPC api
// jest.mock('~/utils/api', () => ({
//   api: {
//     project: {
//       getAll: {
//         useQuery: jest.fn(),
//       },
//       create: {
//         useMutation: jest.fn(),
//       },
//       update: {
//         useMutation: jest.fn(),
//       },
//     },
//   },
// }))

// // Mock Lucide React icons
// jest.mock('lucide-react', () => ({
//   Plus: () => <div data-testid="plus-icon" />,
//   Search: () => <div data-testid="search-icon" />,
//   Filter: () => <div data-testid="filter-icon" />,
//   Grid: () => <div data-testid="grid-icon" />,
//   List: () => <div data-testid="list-icon" />,
//   Users: () => <div data-testid="users-icon" />,
//   Palette: () => <div data-testid="palette-icon" />,
//   X: () => <div data-testid="x-icon" />,
// }))

// // Mock components that aren't being tested
// jest.mock('~/components/header', () => ({
//   Header: () => <div data-testid="header">Header</div>,
// }))

// // mocks/project-card.js or inside jest.setup.js
// jest.mock('~/components/project-card', () => ({
//   ProjectCard: ({ project, updateList }) => (
//     <div data-testid={`project-card-${project.id}`}>
//       <h3>{project.name}</h3>
//       <button onClick={updateList}>Update</button>
//     </div>
//   ),
// }));

// jest.mock('~/components/loading-spinner', () => ({
//   __esModule: true,
//   default: () => <div data-testid="loading-spinner">Loading...</div>,
// }))

// // Mock UI components
// jest.mock('~/components/ui/button', () => ({
//   Button: ({ children, onClick, disabled, ...props }) => (
//     <button onClick={onClick} disabled={disabled} {...props}>
//       {children}
//     </button>
//   ),
// }))

// jest.mock('~/components/ui/input', () => ({
//   Input: (props) => <input {...props} />,
// }))

// jest.mock('~/components/ui/textarea', () => ({
//   Textarea: (props) => <textarea {...props} />,
// }))

// jest.mock('~/components/ui/badge', () => ({
//   Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
// }))

// jest.mock('~/components/ui/dialog', () => ({
//   Dialog: ({ children, open }) => open ? <div data-testid="dialog">{children}</div> : null,
//   DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
//   DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
//   DialogTitle: ({ children }) => <h2 data-testid="dialog-title">{children}</h2>,
// }))

// jest.mock('~/components/ui/form', () => ({
//   Form: ({ children, ...props }) => <form {...props}>{children}</form>,
//   FormControl: ({ children }) => <div>{children}</div>,
//   FormField: ({ render, control, name }) => {
//     const field = { onChange: jest.fn(), value: '', name }
//     return render({ field })
//   },
//   FormItem: ({ children }) => <div>{children}</div>,
//   FormLabel: ({ children }) => <label>{children}</label>,
//   FormMessage: ({ children }) => <div>{children}</div>,
// }))

// // Global test utilities
// global.ResizeObserver = jest.fn().mockImplementation(() => ({
//   observe: jest.fn(),
//   unobserve: jest.fn(),
//   disconnect: jest.fn(),
// }))
