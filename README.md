# 🧩 Collabry — Task Management and Collaboration Tool

Collabry is a full-stack, serverless task management and collaboration app built using **Next.js**, **Supabase**, **tRPC**, and **SST** (Serverless Stack) deployed to **AWS**. It supports team-based task assignment, tagging, and project management with secure Google authentication.

---

[Live Link](https://d35qu8q6pavbde.cloudfront.net/)
## 📐 Tech Stack

| Layer            | Technology                      |
| ---------------- | ------------------------------- |
| Frontend         | Next.js (App Router)            |
| Backend          | tRPC (API layer)                |
| Auth             | NextAuth (Google + Credentials) |
| DB               | Supabase                        |
| Serverless Infra | SST (AWS Lambda)                |
| Deployment       | AWS via SST                     |
| State/Query      | React Query via tRPC            |
| Forms + Schema   | React Hook Form + Zod           |

---

## 🚀 Features

- ✅ Google and email/password login (via NextAuth + Supabase)
- ✅ Create/edit/delete Projects
  - ✔️ Add Members to project
  - ✔️ Can view all projects in which user is member or creator
  - ✔️ Tasks will be created inside project
  - ✔️ Project can be viewed to only those who are member or creator
  - ✔️ A Progress Bar on each project that shows how much tasks are completed
  - ✔️ User can visit to each project and view tasks(if any)
  - ✔️ Creator of project can only add the member
- ✅ Create/edit/delete tasks
  - ✔️ User those are part of the Project can view, add the task
  - ✔️ Creator of task or creator of project or assignee of task can only edit the task other members of project cant edit the task.
  - ✔️ Creator of task can only delete the task
  - ✔️ Priority can be set for task.
- ✅ Assign team members, Priority tags, deadlines
- ✅ Drag-and-drop task board
- ✅ User profile and preferences
- ✅ Project dashboard
- ✅ Responsive and minimal UI
- ✅ Serverless deployment via SST
- ✅ Secure, authenticated API routes via tRPC

---

## 🛠️ Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/abhishekfm/collabry.git
cd collabry

npm install

```

### 2. Environment Configuration

Create these environment files:

📄 .env.development.local

```bash

NEXT_PUBLIC_NEXTAUTH_URL=http://localhost:3000

DATABASE_URL=<your-supabase-db-url>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>

GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

NEXTAUTH_SECRET=<some-random-secret>

```

📄 .env.production

Handled via SST. Environment variables are set in sst.config.ts:

```ts
const web = new sst.aws.Nextjs("Web", {
  path: ".", // path to Next.js app (root directory)
  environment: {
    // Next.js environment vars (make sure to prefix with NEXT_PUBLIC_ for client-side)
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL!,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID!,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET!,
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    // Add other vars (e.g. OAuth IDs) here
  },
  // buildCommand: "npm run build",//not use if you are not building with open next
  dev: {
    command: "npm run dev",
  },
});
```

### 3. Supabase Setup

- Go to Supabase

- Create a project

- Copy project URL and Anon Key

🧱 Architecture Overview

```bash
.
├── src/
│   ├── pages/               # Next.js Pages
│   ├── components/          # Reusable UI components
│   ├── server/              # tRPC routers, API logic
│   │   ├── api/root.ts      # Combined appRouter
│   │   └── api/trpc.ts      # tRPC context
│   ├── env.js               # Runtime-safe env access via Zod
│   └── utils/               # Helpers, hooks, etc.
├── prisma/                  # Prisma schema
├── public/                  # Static assets
├── .env*                   # Local and production env files
├── sst.config.ts           # SST deployment config
└── README.md

```

### 🚢 Deployment (SST + AWS)

1. Prerequisites

- AWS account connected to SST

  > Run in terminal and check if you have aws_access_key_id,
  > aws_secret_access_key configured

  ```bash

  cat ~/.aws/credentials
  npx sst@latest init

  ```

2.  Build
    ```bash
    npx sst build
    ```
3.  Deploy
    ```bash
    npx sst deploy
    ```
4.  Production URLs
    SST will give you a CloudFront URL. Use it to set:

        NEXT_PUBLIC_NEXTAUTH_URL

        Google OAuth Redirect URI

5.  Redirect URIs (Google OAuth)
    Add this in Google console:

```arduino
https://your-cloudfront-url.com/api/auth/callback/google

```

🧩 Known Issues
If redirect after sign-in/sign-out goes to localhost in prod, verify NEXT_PUBLIC_NEXTAUTH_URL is set correctly

Prisma binary errors? Add platform-specific targets to schema.prisma:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```
