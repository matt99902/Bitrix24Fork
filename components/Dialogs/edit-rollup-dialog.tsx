"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rollup as RollupType, Deal as DealType } from "@prisma/client";
import { toast } from "sonner";

// --- Custom types ---
export type DealUpdatePayload = {
  id: string;
  chunk_text?: string | null;
  description?: string | null;
};

export type RollupUpdatePayload = {
  name?: string;
  description?: string | null;
  summary?: string | null;
  deals?: DealUpdatePayload[];
};

interface EditRollupDialogProps {
  rollup: RollupType & { deals?: DealType[] };
}

export default function EditRollupDialog({ rollup }: EditRollupDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(rollup.name);
  const [description, setDescription] = useState(rollup.description ?? "");
  const [summary, setSummary] = useState(rollup.summary ?? "");
  const [deals, setDeals] = useState<DealType[]>(rollup.deals ?? []);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleDealChange = (
    id: string,
    field: keyof Pick<DealType, "chunk_text" | "description">,
    value: string
  ) => {
    setDeals((prev) =>
      prev.map((deal) => (deal.id === id ? { ...deal, [field]: value } : deal))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build partial deal updates
      const updatedDeals: DealUpdatePayload[] = deals.map((d) => ({
        id: d.id,
        chunk_text: d.chunk_text ?? null,
        description: d.description ?? null,
      }));

      const payload: RollupUpdatePayload = {
        name,
        description,
        summary,
        deals: updatedDeals.length ? updatedDeals : undefined,
      };

      const res = await fetch(`/api/rollups/${rollup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update rollup");
      }

      toast.success("Rollup updated!");
      setOpen(false);
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save rollup");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Rollup</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="AI-generated summary or custom notes"
            />
          </div>

          {deals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Deals</h2>
              {deals.map((deal) => (
                <div key={deal.id} className="border rounded-md p-3 bg-gray-50 space-y-2">
                  <p className="font-medium">{deal.title || deal.dealCaption}</p>
                  <Textarea
                    value={deal.chunk_text ?? ""}
                    onChange={(e) => handleDealChange(deal.id, "chunk_text", e.target.value)}
                    placeholder="Chunk text"
                  />
                  <Textarea
                    value={deal.description ?? ""}
                    onChange={(e) => handleDealChange(deal.id, "description", e.target.value)}
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}