"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Star, Play } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Link from "next/link";
import { Header } from "~/components/header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import HeaderTray from "~/components/header-tray";
import Head from "next/head";

const teamAvatars = [
  {
    src: "https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg",
    alt: "Sarah",
    fallback: "S",
  },
  {
    src: "https://images.pexels.com/photos/2065203/pexels-photo-2065203.jpeg",
    alt: "Mike",
    fallback: "M",
  },
  { src: "/placeholder.svg?height=48&width=48", alt: "Emma", fallback: "E" },
  { src: "/placeholder.svg?height=48&width=48", alt: "Alex", fallback: "A" },
  { src: "/placeholder.svg?height=48&width=48", alt: "Lisa", fallback: "L" },
];

const features = [
  "Intuitive drag & drop interface",
  "Real-time collaboration",
  "Advanced project analytics",
  "Custom workflows",
  "Team performance insights",
  "Enterprise-grade security",
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    company: "TechFlow",
    content:
      "Collabry transformed our team's productivity. The interface is so intuitive that everyone adopted it immediately.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Marcus Rodriguez",
    role: "Engineering Lead",
    company: "BuildCorp",
    content:
      "Finally, a project management tool that doesn't get in the way. Clean, fast, and incredibly powerful.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Emily Watson",
    role: "Design Director",
    company: "Creative Studio",
    content:
      "The best project management experience we've ever had. Beautiful design meets powerful functionality.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <>
      <Head>
        <title> Collabry | Collabration</title>
        <meta name="Collabry" content={`Collabry Landing Page`} />
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Navigation */}
        <nav className="relative z-50 px-6 py-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
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

            {/* Navigation Links */}
            {status !== "loading" && session?.user.email ? (
              <HeaderTray />
            ) : (
              <motion.div
                className="flex items-center gap-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Link
                  href="/auth/signin"
                  className="text-slate-600 transition-colors hover:text-slate-900"
                >
                  Login
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-slate-900 px-6 text-white hover:bg-slate-800">
                    Register
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative px-6 pb-32 pt-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Team Avatars */}
            <motion.div
              className="mb-8 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex -space-x-2">
                {teamAvatars.map((avatar, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage
                        src={avatar.src || "/placeholder.svg"}
                        alt={avatar.alt}
                      />
                      <AvatarFallback className="bg-slate-100 text-sm font-medium text-slate-600">
                        {avatar.fallback}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="mb-6 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The project management
              <br />
              <span className="text-slate-600">you&apos;re looking for</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-600"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Collabry is a modern project management platform that changes how
              teams collaborate, track progress, and deliver results together.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/dashboard">
                <Button className="group bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="group px-8 py-3 text-lg font-medium text-slate-600 hover:text-slate-900"
              >
                <Play className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              className="relative mx-auto max-w-5xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <div className="relative rounded-xl bg-slate-900 p-2 shadow-2xl">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm text-slate-400">collabry.com</div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="aspect-[16/10] overflow-hidden rounded-b-lg bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="h-full p-8">
                    {/* Mock Dashboard Header */}
                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-lg bg-blue-600" />
                        <div className="h-4 w-32 rounded bg-slate-700" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 w-20 rounded bg-slate-700" />
                        <div className="h-8 w-24 rounded bg-blue-600" />
                      </div>
                    </div>

                    {/* Mock Project Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-700 bg-slate-800 p-6"
                        >
                          <div className="mb-4 flex items-center gap-3">
                            <div
                              className={`h-3 w-3 rounded-full ${i === 1 ? "bg-blue-500" : i === 2 ? "bg-green-500" : "bg-purple-500"}`}
                            />
                            <div className="h-4 w-24 rounded bg-slate-600" />
                          </div>
                          <div className="mb-4 space-y-2">
                            <div className="h-3 w-full rounded bg-slate-600" />
                            <div className="h-3 w-3/4 rounded bg-slate-600" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-1">
                              {[1, 2, 3].map((j) => (
                                <div
                                  key={j}
                                  className="h-6 w-6 rounded-full border-2 border-slate-800 bg-slate-600"
                                />
                              ))}
                            </div>
                            <div className="h-2 w-16 rounded-full bg-slate-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              {/* Features List */}
              <div>
                <h2 className="mb-6 text-4xl font-bold text-slate-900">
                  Everything you need to succeed
                </h2>
                <p className="mb-10 text-xl leading-relaxed text-slate-600">
                  Powerful features designed to streamline your workflow and
                  boost team productivity.
                </p>

                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors"
                      onHoverStart={() => setHoveredFeature(index)}
                      onHoverEnd={() => setHoveredFeature(null)}
                      whileHover={{ backgroundColor: "#f8fafc" }}
                    >
                      <div className="flex-shrink-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <span className="text-lg font-medium text-slate-700">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Feature Visualization */}
              <div className="relative">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
                  <div className="space-y-6">
                    {/* Mock Kanban Board */}
                    <div className="flex gap-8">
                      {["To Do", "In Progress", "Done"].map((status, index) => (
                        <div key={status} className="flex-1">
                          <div className="mb-3 text-sm font-medium text-slate-600">
                            {status}
                          </div>
                          <div className="space-y-3">
                            {[1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                                animate={{
                                  scale: hoveredFeature === index ? 1.02 : 1,
                                  y: hoveredFeature === index ? -2 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="mb-2 h-3 w-full rounded bg-slate-200" />
                                <div className="mb-3 h-3 w-2/3 rounded bg-slate-200" />
                                <div className="flex items-center justify-between">
                                  <div className="flex -space-x-1">
                                    {[1, 2].map((j) => (
                                      <div
                                        key={j}
                                        className="h-5 w-5 rounded-full bg-slate-300"
                                      />
                                    ))}
                                  </div>
                                  <div className="h-2 w-8 rounded bg-slate-200" />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-slate-50 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-slate-900">
                Loved by teams worldwide
              </h2>
              <p className="text-xl text-slate-600">
                See what our customers say about their experience
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-4 flex gap-1">
                    {[...(Array(5).fill("s") as string[])].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-current text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-slate-700">
                    {testimonial.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                      />
                      <AvatarFallback className="bg-slate-100 text-slate-600">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-slate-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-white px-6 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold text-slate-900">
              Ready to transform your workflow?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600">
              Join thousands of teams who have revolutionized their project
              management with Collabry.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/dashboard">
                <Button className="bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700">
                  Start Your Free Trial
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-slate-300 px-8 py-3 text-lg font-medium text-slate-700"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <div className="mb-4 flex items-center gap-3 md:mb-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                  <div className="h-4 w-4 rounded-sm bg-white" />
                </div>
                <span className="text-xl font-semibold text-slate-900">
                  Collabry
                </span>
              </div>
              <div className="flex gap-8 text-slate-600">
                <a href="#" className="transition-colors hover:text-slate-900">
                  Privacy
                </a>
                <a href="#" className="transition-colors hover:text-slate-900">
                  Terms
                </a>
                <a href="#" className="transition-colors hover:text-slate-900">
                  Support
                </a>
              </div>
            </div>
            <div className="mt-8 border-t border-slate-200 pt-8 text-center text-slate-500">
              <p>&copy; 2024 Collabry. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// import { signIn, signOut, useSession } from "next-auth/react";
// import Head from "next/head";
// import Link from "next/link";

// import { api } from "~/utils/api";

// export default function Home() {
//   const hello = api.post.hello.useQuery({ text: "from tRPC" });

//   return (
//     <>
//       <Head>
//         <title>Create T3 App</title>
//         <meta name="description" content="Generated by create-t3-app" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
//         <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
//           <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
//             Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
//           </h1>
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
//             <Link
//               className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
//               href="https://create.t3.gg/en/usage/first-steps"
//               target="_blank"
//             >
//               <h3 className="text-2xl font-bold">First Steps →</h3>
//               <div className="text-lg">
//                 Just the basics - Everything you need to know to set up your
//                 database and authentication.
//               </div>
//             </Link>
//             <Link
//               className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
//               href="https://create.t3.gg/en/introduction"
//               target="_blank"
//             >
//               <h3 className="text-2xl font-bold">Documentation →</h3>
//               <div className="text-lg">
//                 Learn more about Create T3 App, the libraries it uses, and how
//                 to deploy it.
//               </div>
//             </Link>
//           </div>
//           <div className="flex flex-col items-center gap-2">
//             <p className="text-2xl text-white">
//               {hello.data ? hello.data.greeting : "Loading tRPC query..."}
//             </p>
//             <AuthShowcase />
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }

// function AuthShowcase() {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.post.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// }
