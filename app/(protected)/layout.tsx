import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import MenuDialog from "@/components/Dialogs/menu-dialog";
import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "@/auth";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react";
import { Lora } from "next/font/google";

export const metadata: Metadata = {
  title: "Dark Alpha Capital Deal Sourcing Organization",
  description: "Sourcing and Scrape Deals with AI",
};

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userSession = await auth();

  return (
    <html lang="en" className={cn(lora.variable)} suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <main>
              <MenuDialog />
              <Header session={userSession} />

              {children}
              <Footer />
            </main>
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
