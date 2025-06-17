import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Toaster } from "react-hot-toast";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { TooltipProvider } from "~/components/ui/tooltip";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <TooltipProvider>
        <div className={GeistSans.className}>
          <Toaster position="bottom-center" />
          <Component {...pageProps} />
        </div>
      </TooltipProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
