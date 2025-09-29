import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import DeleteRollupButton from "@/components/buttons/delete-rollup-button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "View Rollups",
  description: "View and manage all rollups",
};

interface Deal {
  id: string;
  title?: string | null;
  dealCaption: string;
  brokerage: string;
  revenue: number;
  ebitda: number;
  industry: string;
  score?: number;
  bitrixStatus?: string;
  business_strategy?: string;
  growth_stage?: string;
  dealTeaser?: string;
  chunk_text?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  linkedinUrl?: string;
  workPhone?: string;
  sourceWebsite?: string;
}

interface Rollup {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deals: Deal[];
  users: { id: string; name?: string | null; email: string; role?: string }[];
}

// Server-side data fetching function
async function getRollups(): Promise<Rollup[]> {
  try {
    const rollups = await prisma.rollup.findMany({
      include: { users: true, deals: true },
      orderBy: { createdAt: "desc" },
    });
    return rollups.map((rollup) => ({
      ...rollup,
      description: rollup.description === null ? undefined : rollup.description,
    }));
  } catch (error) {
    console.error("Error fetching rollups:", error);
    return [];
  }
}

async function getCurrentUserRole() {
  const session = await auth();
  return session?.user?.role || null;
}

export default async function ViewRollupsPage() {
  const [rollups, currentUserRole] = await Promise.all([
    getRollups(),
    getCurrentUserRole(),
  ]);

  if (rollups.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ChevronUp className="h-5 w-5" />
          All Rollups
        </h1>
        <div className="text-center mt-12">
          <p className="text-xl text-muted-foreground">No rollups found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ChevronUp className="h-5 w-5" />
        All Rollups
      </h1>

      <div className="flex flex-col gap-4">
        {rollups.map((rollup) => (
          <div
            key={rollup.id}
            className="border rounded-md p-4 bg-background shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{rollup.name}</h2>
              <span className="text-sm text-muted-foreground">
                {new Date(rollup.createdAt).toLocaleDateString()}
              </span>
            </div>

            {rollup.description && (
              <p className="mb-2 text-sm text-muted-foreground">
                {rollup.description}
              </p>
            )}

            <div className="mb-2">
              <strong>Deals in this rollup:</strong>
              <ul className="mt-1 ml-4 list-disc text-sm text-muted-foreground">
                {rollup.deals.map((deal) => (
                  <li key={deal.id} className="mb-1">
                    <div className="font-semibold">
                      {deal.title || deal.dealCaption}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Brokerage: {deal.brokerage} | Revenue: ${deal.revenue.toLocaleString()} | 
                      EBITDA: ${deal.ebitda.toLocaleString()} | Industry: {deal.industry}
                    </div>
                    {deal.score !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        Score: {(deal.score * 100).toFixed(0)}%
                      </div>
                    )}
                    {deal.bitrixStatus && (
                      <div className="text-sm text-muted-foreground">
                        Status: {deal.bitrixStatus}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 text-sm text-muted-foreground mb-2">
              <strong>Saved by:</strong>{" "}
              {rollup.users.map((user) => user.name || user.email).join(", ")}
            </div>

            <div className="flex gap-2">
              <DeleteRollupButton
                rollupId={rollup.id}
                userRole={currentUserRole}
              />

              <Button size="sm" variant="outline" asChild>
                <Link href={`/rollup-details/${rollup.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}