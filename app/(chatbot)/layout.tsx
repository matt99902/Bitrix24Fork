import React from "react";
import { Metadata } from "next";
import "../globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

import { SessionProvider } from "next-auth/react";
import { raleway, bitter } from "@/app/fonts";

export const metadata: Metadata = {
  title: "Dark Alpha Capital Deal Sourcing Organization",
  description: "Sourcing and Scrape Deals with AI",
};

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="en"
      className={cn(raleway.variable, bitter.variable)}
      suppressHydrationWarning
    >
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <main>{children}</main>
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default layout;
