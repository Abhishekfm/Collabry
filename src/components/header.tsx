"use client";

import { Bell, Settings, User, LogOut } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { env } from "~/env";


export function Header() {
  const session = useSession();
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <div className="h-4 w-4 rounded-sm bg-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">
              Collabry
            </span>
          </motion.div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        session?.data?.user.image ??
                        "/placeholder.svg?height=32&width=32"
                      }
                      alt="User"
                    />
                    <AvatarFallback>
                      {session?.data?.user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{session?.data?.user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {session?.data?.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href={"/setting"}>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                {/* <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
          console.log("signout",window.location.origin, env.NEXT_PUBLIC_NEXTAUTH_URL)
                  
                  await signOut({callbackUrl: env.NEXT_PUBLIC_NEXTAUTH_URL})}}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
