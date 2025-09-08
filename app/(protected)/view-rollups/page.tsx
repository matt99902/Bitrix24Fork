"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

interface Deal {
  id: string;
  title?: string | null;
  dealCaption: string;
  brokerage: string;
  revenue: number;
  ebitda: number;
  industry: string;
}

interface Rollup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deals: Deal[];
  users: { id: string; name?: string | null; email: string }[];
}

export default function ViewRollupsPage() {
  const [rollups, setRollups] = useState<Rollup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRollups() {
      try {
        // Uncomment the following lines to enforce login
        // const userSession = await fetch("/api/auth/session").then(res => res.json());
        // if (!userSession) return;

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

  if (loading) {
    return <div className="p-6">Loading rollups...</div>;
  }

  if (!rollups.length) {
    return <div className="p-6">No rollups found.</div>;
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
                  <li key={deal.id}>
                    {deal.title || deal.dealCaption} - {deal.brokerage} - $
                    {deal.revenue.toLocaleString()} Revenue / $
                    {deal.ebitda.toLocaleString()} EBITDA
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <strong>Saved by:</strong>{" "}
              {rollup.users.map((user) => user.name || user.email).join(", ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
