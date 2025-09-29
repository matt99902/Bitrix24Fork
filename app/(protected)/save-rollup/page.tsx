import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SaveRollupClient from "@/components/SaveRollupClient";

export const metadata: Metadata = {
  title: "Save Rollup",
  description: "Save selected deals as a rollup",
};

// Simplified placeholder type, need to fetch these from source
interface PlaceholderDeal {
  id: string;
  brokerage: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  linkedinUrl?: string | null;
  workPhone?: string | null;
  revenue: number;
  ebitda: number;
  industry: string;
  dealCaption: string;
  title?: string | null;
}

// Server-side function to get deals (placeholder implementation)
async function getDealsForRollup(): Promise<PlaceholderDeal[]> {
  // 1. Get deals from URL params/search params
  // 2. Fetch from database based on selection criteria
  // 3. Get from session storage or other state management

  return [
    {
      id: "1",
      brokerage: "Example Brokerage",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      linkedinUrl: "https://linkedin.com/in/johndoe",
      workPhone: "1234567890",
      revenue: 1000000,
      ebitda: 200000,
      industry: "Technology",
      dealCaption: "Tech Acquisition",
      title: "Tech Acquisition",
    },
    {
      id: "2",
      brokerage: "Example Brokerage",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      linkedinUrl: null,
      workPhone: null,
      revenue: 500000,
      ebitda: 100000,
      industry: "Finance",
      dealCaption: "Finance Merger",
      title: "Finance Merger",
    },
    {
      id: "3",
      brokerage: "Example Brokerage",
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      linkedinUrl: null,
      workPhone: null,
      revenue: 750000,
      ebitda: 150000,
      industry: "Healthcare",
      dealCaption: "Healthcare Expansion",
      title: "Healthcare Expansion",
    },
  ];
}

async function getCurrentUserSession() {
  return await auth();
}

export default async function SaveRollupPage() {
  const [deals, session] = await Promise.all([
    getDealsForRollup(),
    getCurrentUserSession(),
  ]);

  // Optionally protect the route
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <SaveRollupClient 
      initialDeals={deals} 
      userRole={session.user?.role || null} 
    />
  );
}