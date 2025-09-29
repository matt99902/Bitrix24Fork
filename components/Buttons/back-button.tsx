"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => router.back()}
      className="flex items-center gap-2"
    >
      <ChevronLeft className="h-4 w-4" /> Previous Page
    </Button>
  );
}