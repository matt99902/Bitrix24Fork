"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RemoveDealButtonProps {
  dealId: string;
  userRole: string | null;
}

export default function RemoveDealButton({ dealId, userRole }: RemoveDealButtonProps) {
  const handleRemoveDeal = async () => {
    if (userRole !== "ADMIN") {
      toast.error("Only admins can remove deals.");
      return;
    }
    toast.info(`Pretend removing deal ${dealId} (API not wired yet).`);
  };

  return (
    <Button
      size="sm"
      variant={userRole === "ADMIN" ? "destructive" : "secondary"}
      disabled={userRole !== "ADMIN"}
      onClick={handleRemoveDeal}
      className="mt-2"
    >
      {userRole === "ADMIN" ? "Remove Deal" : "Only admins can remove deals"}
    </Button>
  );
}