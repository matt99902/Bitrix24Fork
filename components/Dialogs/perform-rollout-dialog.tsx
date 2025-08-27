"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

const PerformRolloutDialog = () => {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Rocket className="mr-2 h-4 w-4" /> Perform Rollout
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perform Rollout</DialogTitle>
          <DialogDescription>
            Perform Rollout based on:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button variant="secondary" className="w-full">
            Similar Deals
          </Button>
          <Button variant="secondary" className="w-full">
            Placeholder 1
          </Button>
          <Button variant="secondary" className="w-full">
            Placeholder 2
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PerformRolloutDialog;
