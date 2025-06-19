/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "collabry",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },

  run: async () => {
    // --- tRPC API: single Lambda behind an HTTP API (ApiGatewayV2) ---
    // const api = new sst.aws.ApiGatewayV2("Api");
    // api.route("POST /trpc/{proxy+}", {
    //   handler: "Functions/src/server/handler.ts",
    //   environment: {
    //     // Pass in environment variables for Prisma, Supabase, NextAuth, etc.
    //     DATABASE_URL: process.env.DATABASE_URL || "",
    //     SUPABASE_URL: process.env.SUPABASE_URL || "",
    //     SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    //     NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
    //     NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
    //     // You can add other keys (e.g. OAuth client IDs) as needed
    //   },
    // });

    // --- Frontend: Next.js (Page Router) site ---
    const web = new sst.aws.Nextjs("Web", {
      path: ".", // path to Next.js app (root directory)
      environment: {
        // Next.js environment vars (make sure to prefix with NEXT_PUBLIC_ for client-side)
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID!,
        DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET!,
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
        // Add other vars (e.g. OAuth IDs) here
      },
      // buildCommand: "npm run build",
      dev: {
        command: "npm run dev",
        url: "http://localhost:3000",
      },
    });

    // console.log("web", web);

    return {
      // Outputs (e.g. the HTTP API URL for tRPC)
      // ApiUrl: api.url,
      link: web.getSSTLink(),
      webUrl: web.url,
    };
  },
});
