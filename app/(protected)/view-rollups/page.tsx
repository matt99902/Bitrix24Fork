"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { toast } from "sonner";

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
  createdAt: string;
  updatedAt: string;
  deals: Deal[];
  users: { id: string; name?: string | null; email: string; role?: string }[];
}

export default function ViewRollupsPage() {
  const [rollups, setRollups] = useState<Rollup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRollups() {
      try {
        const res = await fetch("/api/rollups");
        const data = await res.json();
        setRollups(data.rollups || []);
      } catch (error) {
        console.error("Error fetching rollups:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRollups();
  }, []);

  async function handleDelete(rollupId: string, userRole?: string) {
    if (userRole !== "ADMIN") {
      toast.error("Only admins can delete rollups.");
      return;
    }

    try {
      const res = await fetch(`/api/rollups/${rollupId}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        toast.success("Rollup deleted successfully!");
        setRollups((prev) => prev.filter((r) => r.id !== rollupId));
      } else {
        toast.error(data.error || "Failed to delete rollup.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete rollup.");
    }
  }

  if (loading) return <div className="p-6">Loading rollups...</div>;
  if (!rollups.length) return <div className="p-6">No rollups found.</div>;

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
                      Brokerage: {deal.brokerage} | Revenue: ${deal.revenue.toLocaleString()} | EBITDA: ${deal.ebitda.toLocaleString()} | Industry: {deal.industry}
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
                    {(deal.business_strategy || deal.growth_stage) && (
                      <div className="text-sm text-muted-foreground">
                        Strategy: {deal.business_strategy || "—"} | Growth: {deal.growth_stage || "—"}
                      </div>
                    )}
                    {(deal.dealTeaser || deal.chunk_text) && (
                      <div className="text-sm text-muted-foreground">
                        {deal.dealTeaser || deal.chunk_text}
                      </div>
                    )}
                    {(deal.firstName || deal.lastName || deal.email || deal.linkedinUrl || deal.workPhone) && (
                      <div className="text-sm text-muted-foreground">
                        Contact: {deal.firstName || ""} {deal.lastName || ""} | {deal.email || "—"} | {deal.linkedinUrl ? <a href={deal.linkedinUrl} className="text-blue-500 underline">LinkedIn</a> : "—"} | {deal.workPhone || "—"}
                      </div>
                    )}
                    {deal.sourceWebsite && (
                      <div className="text-sm text-muted-foreground">
                        Source: <a href={deal.sourceWebsite} className="text-blue-500 underline">{deal.sourceWebsite}</a>
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

            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                handleDelete(
                  rollup.id,
                  rollup.users[0]?.role // demo; ideally use logged-in user's role
                )
              }
            >
              Delete Rollup
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
