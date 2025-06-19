import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.string().url(), // ✅ only here
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    // DISCORD_CLIENT_ID: z.string(),
    // DISCORD_CLIENT_SECRET: z.string(),

  },

  /**
   * Client-side environment variables (MUST start with NEXT_PUBLIC_).
   */
  client: {
    NEXT_PUBLIC_NEXTAUTH_URL: z.preprocess(
      () => process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_NEXTAUTH_URL,
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    // Add more public vars here if needed
  },

  /**
   * Runtime variables passed in from process.env
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL, // ✅ server-side only
    NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    // DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    // DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
