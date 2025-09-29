"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import RemoveDealButton from "@/components/Buttons/remove-deal-button";
import { DealWithAI } from "@/app/protected/rollup-details/[id]/page";

interface ExpandableDealListProps {
  deals: DealWithAI[];
  currentUser: { role?: string } | null;
}

export default function ExpandableDealList({ deals, currentUser }: ExpandableDealListProps) {
  const [expandedDeals, setExpandedDeals] = useState<Record<string, boolean>>({});

  const toggleDeal = (dealId: string) =>
    setExpandedDeals((prev) => ({ ...prev, [dealId]: !prev[dealId] }));

  return (
    <ul className="space-y-2">
      {deals.map((deal) => {
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

                <RemoveDealButton
                  dealId={deal.id}
                  userRole={currentUser?.role || null}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}