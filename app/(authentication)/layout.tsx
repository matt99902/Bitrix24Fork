import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(lora.variable)}>
      <body className={`antialiased`}>
        <main>
          <div>{children}</div>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
