"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import EditRollupDialog from "@/components/Dialogs/edit-rollup-dialog";
import { Rollup as RollupType, Deal as DealType, User as UserType } from "@prisma/client";
import { RollupUpdatePayload, DealUpdatePayload } from "@/components/Dialogs/edit-rollup-dialog";

// Augmented Deal type including frontend-only AI fields
export type DealWithAI = DealType & {
  score?: number;
  grossRevenue?: number;
  dealTeaser?: string;
  confidence_business_strategy?: number;
  confidence_growth_stage?: number;
};

// Rollup with relations + AI-enhanced deals
export type RollupWithRelations = RollupType & {
  deals: DealWithAI[];
  users: UserType[];
};

interface UserSession extends UserType {}

interface RollupDetailsPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default function RollupDetailsPage({ params }: RollupDetailsPageProps) {
  const [rollup, setRollup] = useState<RollupWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [expandedDeals, setExpandedDeals] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    async function fetchRollup() {
      const resolvedParams = await Promise.resolve(params);

      try {
        const res = await fetch(`/api/rollups/${resolvedParams.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch rollup");

        // Cast deals to DealWithAI
        const enrichedDeals: DealWithAI[] = (data.rollup.deals || []).map((deal: DealType) => ({
          ...deal,
          score: Math.random(),
          grossRevenue: deal.revenue * 1.1,
          confidence_business_strategy: 0.8,
          confidence_growth_stage: 0.7,
          dealTeaser: deal.dealTeaser || "AI-generated teaser",
          chunk_text: deal.chunk_text || "AI-enriched chunk text",
          description: deal.description || "AI description placeholder",
        }));

        setRollup({ ...data.rollup, deals: enrichedDeals });
      } catch (err) {
        console.error(err);
        toast.error("Error fetching rollup details");
        setRollup(null);
      } finally {
        setLoading(false);
      }

      // Fetch current user session
      try {
        const resUser = await fetch("/api/auth/session");
        const dataUser = await resUser.json();
        setCurrentUser(dataUser?.user ?? null);
      } catch {}
    }

    fetchRollup();
  }, [params]);

  const handleUpdateRollup = async (updated: RollupUpdatePayload) => {
    if (!rollup) return;

    try {
      const res = await fetch(`/api/rollups/${rollup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update rollup");

      // Merge updated deals if returned
      const updatedDeals: DealWithAI[] =
        data.rollup.deals?.map((d: DealType) => ({
          ...d,
          score: Math.random(),
          grossRevenue: d.revenue * 1.1,
          confidence_business_strategy: 0.8,
          confidence_growth_stage: 0.7,
          dealTeaser: d.dealTeaser || "AI-generated teaser",
          chunk_text: d.chunk_text || "AI-enriched chunk text",
          description: d.description || "AI description placeholder",
        })) || [];

      setRollup({ ...data.rollup, deals: updatedDeals });
      toast.success("Rollup updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update rollup");
    }
  };

  const toggleDeal = (dealId: string) =>
    setExpandedDeals((prev) => ({ ...prev, [dealId]: !prev[dealId] }));

  const handleRemoveDeal = async (dealId: string) => {
    if (currentUser?.role !== "ADMIN") {
      toast.error("Only admins can remove deals.");
      return;
    }
    toast.info(`Pretend removing deal ${dealId} (API not wired yet).`);
  };

  if (loading) return <div className="p-6">Loading rollup details...</div>;
  if (!rollup) return <div className="p-6">Rollup not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" /> Previous Page
      </Button>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{rollup.name}</h1>
        <EditRollupDialog rollup={rollup} onSave={handleUpdateRollup} />
      </div>

      {rollup.description && <p className="text-muted-foreground">{rollup.description}</p>}
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
        <ul className="space-y-2">
          {rollup.deals.map((deal) => {
            const expanded = expandedDeals[deal.id];
            return (
              <li key={deal.id} className="border rounded-md p-3 shadow-sm bg-background">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleDeal(deal.id)}
                >
                  <span className="font-semibold">{deal.title || deal.dealCaption}</span>
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>

                {expanded && (
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div>
                      Brokerage: {deal.brokerage} | Revenue: ${deal.revenue.toLocaleString()} | Gross Revenue: $
                      {deal.grossRevenue?.toLocaleString()} | EBITDA: ${deal.ebitda.toLocaleString()} | EBITDA Margin:{" "}
                      {deal.ebitdaMargin ?? "—"}% | Industry: {deal.industry}
                    </div>
                    {deal.score !== undefined && <div>Score: {(deal.score * 100).toFixed(0)}%</div>}
                    {deal.confidence_business_strategy !== undefined && (
                      <div>Confidence (Business Strategy): {(deal.confidence_business_strategy * 100).toFixed(0)}%</div>
                    )}
                    {deal.confidence_growth_stage !== undefined && (
                      <div>Confidence (Growth Stage): {(deal.confidence_growth_stage * 100).toFixed(0)}%</div>
                    )}
                    {deal.dealTeaser && <div>{deal.dealTeaser}</div>}
                    {deal.chunk_text && <div>{deal.chunk_text}</div>}
                    {deal.description && <div>{deal.description}</div>}

                    <Button
                      size="sm"
                      variant={currentUser?.role === "ADMIN" ? "destructive" : "secondary"}
                      disabled={currentUser?.role !== "ADMIN"}
                      onClick={() => handleRemoveDeal(deal.id)}
                      className="mt-2"
                    >
                      {currentUser?.role === "ADMIN" ? "Remove Deal" : "Only admins can remove deals"}
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
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
