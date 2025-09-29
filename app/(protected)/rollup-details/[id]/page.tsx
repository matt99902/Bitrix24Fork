import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import EditRollupDialog from "@/components/Dialogs/edit-rollup-dialog";
import BackButton from "@/components/Buttons/back-button";
import ExpandableDealList from "@/components/ExpandableDealList";
import { Rollup as RollupType, Deal as DealType, User as UserType } from "@prisma/client";

export type DealWithAI = DealType & {
  score?: number;
  grossRevenue?: number;
  dealTeaser?: string;
  confidence_business_strategy?: number;
  confidence_growth_stage?: number;
};

export type RollupWithRelations = RollupType & {
  deals: DealWithAI[];
  users: UserType[];
};

interface RollupDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RollupDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  
  const rollup = await prisma.rollup.findUnique({
    where: { id },
    select: { name: true },
  });

  return {
    title: rollup ? `${rollup.name} - Rollup Details` : "Rollup Details",
    description: "View and manage rollup details",
  };
}

async function getRollup(id: string): Promise<RollupWithRelations | null> {
  try {
    const rollup = await prisma.rollup.findUnique({
      where: { id },
      include: {
        users: true,
        deals: true,
      },
    });

    if (!rollup) return null;


    const enrichedDeals: DealWithAI[] = rollup.deals.map((deal) => ({
      ...deal,
      score: Math.random(),
      grossRevenue: deal.revenue * 1.1,
      confidence_business_strategy: 0.8,
      confidence_growth_stage: 0.7,
      dealTeaser: deal.dealTeaser || "AI-generated teaser",
      chunk_text: deal.chunk_text || "AI-enriched chunk text",
      description: deal.description || "AI description placeholder",
    }));

    return { ...rollup, deals: enrichedDeals };
  } catch (error) {
    console.error("Error fetching rollup:", error);
    return null;
  }
}

async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

export default async function RollupDetailsPage({ params }: RollupDetailsPageProps) {
  const { id } = await params;
  
  const [rollup, currentUser] = await Promise.all([
    getRollup(id),
    getCurrentUser(),
  ]);

  if (!rollup) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <BackButton />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{rollup.name}</h1>
        <EditRollupDialog rollup={rollup} />
      </div>

      {rollup.description && (
        <p className="text-muted-foreground">{rollup.description}</p>
      )}
      
      {rollup.summary && (
        <div className="p-3 bg-gray-50 rounded-md">
          <h2 className="font-semibold">AI Summary</h2>
          <p className="text-sm text-muted-foreground">{rollup.summary}</p>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Created: {new Date(rollup.createdAt).toLocaleString()} | Updated:{" "}
        {new Date(rollup.updatedAt).toLocaleString()}
      </p>

      {/* Deals Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Deals</h2>
        <ExpandableDealList deals={rollup.deals} currentUser={currentUser} />
      </div>

      {/* Users Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Saved by Users</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          {rollup.users.map((user) => (
            <li key={user.id}>
              {user.name || user.email} {user.role ? `(${user.role})` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}