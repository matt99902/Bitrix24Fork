"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteRollupButtonProps {
  rollupId: string;
  userRole: string | null;
}

export default function DeleteRollupButton({ rollupId, userRole }: DeleteRollupButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (userRole !== "ADMIN") {
      toast.error("Only admins can delete rollups.");
      return;
    }

    try {
      const res = await fetch(`/api/rollups/${rollupId}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        toast.success("Rollup deleted successfully!");
        // Refresh the page to update the list
        router.refresh();
      } else {
        toast.error(data.error || "Failed to delete rollup.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete rollup.");
    }
  }

  return (
    <Button
      size="sm"
      variant={userRole === "ADMIN" ? "destructive" : "secondary"}
      disabled={userRole !== "ADMIN"}
      onClick={handleDelete}
    >
      {userRole === "ADMIN" ? "Delete Rollup" : "Only admins can delete"}
    </Button>
  );
}