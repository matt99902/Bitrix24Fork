"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import SaveRollupDialog from "@/components/Dialogs/save-rollup-dialog";

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

interface SaveRollupClientProps {
  initialDeals: PlaceholderDeal[];
  userRole: string | null;
}

export default function SaveRollupClient({ initialDeals, userRole }: SaveRollupClientProps) {
  const router = useRouter();
  const [deals, setDeals] = useState<PlaceholderDeal[]>(initialDeals);
  const [selectedDeals, setSelectedDeals] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedDeals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const deleteSelected = () => {
    if (userRole !== "ADMIN") {
      toast.error("Only admins can delete deals from a rollup.");
      return;
    }

    setDeals((prev) => prev.filter((deal) => !selectedDeals.has(deal.id)));
    setSelectedDeals(new Set());
    toast.success("Selected deals deleted.");
  };

  const handleSaveRollup = async (name: string, description: string) => {
    if (userRole !== "ADMIN") {
      toast.error("Only admins can save a rollup.");
      return;
    }

    if (selectedDeals.size === 0) {
      toast.error("Please select at least one deal to save a rollup.");
      return;
    }

    const selectedDealIds = Array.from(selectedDeals);

    try {
      const res = await fetch("/api/rollups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          dealIds: selectedDealIds,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Rollup "${name}" saved with ${selectedDealIds.length} deals!`);
        router.push("/view-rollups");
      } else {
        toast.error(data.error || "Failed to save rollup.");
      }
    } catch (error) {
      console.error("Error saving rollup:", error);
      toast.error("Failed to save rollup.");
    }
  };

  return (
    <div className="p-6">
      {/* Previous Page Button */}
      <Button
        variant="outline"
        className="mb-4 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous Page
      </Button>

      <h1 className="text-2xl font-bold mb-4">Deals Found</h1>

      {/* Deal List */}
      <div className="flex flex-col gap-4 mb-4 border p-4 rounded-md">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="flex items-start gap-3 border-b last:border-b-0 pb-3"
          >
            <input
              type="checkbox"
              checked={selectedDeals.has(deal.id)}
              onChange={() => toggleSelect(deal.id)}
              className="mt-1 h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <div className="flex-1 space-y-1">
              <div className="font-semibold">{deal.title}</div>
              <div className="text-sm text-muted-foreground">
                <p>Brokerage: {deal.brokerage}</p>
                <p>
                  Name: {deal.firstName} {deal.lastName}
                </p>
                <p>Email: {deal.email || "—"}</p>
                <p>LinkedIn: {deal.linkedinUrl || "—"}</p>
                <p>Phone: {deal.workPhone || "—"}</p>
                <p>Revenue: ${deal.revenue.toLocaleString()}</p>
                <p>EBITDA: ${deal.ebitda.toLocaleString()}</p>
                <p>Industry: {deal.industry}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="destructive" onClick={deleteSelected}>
          Delete Selected
        </Button>

        <SaveRollupDialog onSave={handleSaveRollup} />
      </div>
    </div>
  );
}