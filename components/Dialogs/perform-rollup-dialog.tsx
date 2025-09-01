"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function PerformRollupDialog() {
  const [activeSection, setActiveSection] = useState<"custom" | "filters" | null>(null);

  const [customDescription, setCustomDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [revenueRange, setRevenueRange] = useState<[number, number]>([0, 1000000]);
  const [ebitdaRange, setEbitdaRange] = useState<[number, number]>([0, 30]);
  const [strategicFocus, setStrategicFocus] = useState<string[]>([]);

  const handleCheckboxChange = (value: string) => {
    setStrategicFocus((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = () => {
    const rollupData = {
      customDescription,
      industry,
      location,
      revenueRange,
      ebitdaMarginRange: ebitdaRange,
      strategicFocus,
    };
    console.log("Rollup Submitted:", rollupData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <ChevronUp className="h-4 w-4" />
          Perform Rollup
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perform Rollup</DialogTitle>
          <DialogDescription>
            Choose how you want to perform the rollup for this deal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          {/* Section Selection */}
          <div className="flex gap-4">
            <Button
              variant={activeSection === "custom" ? "default" : "outline"}
              onClick={() => setActiveSection(activeSection === "custom" ? null : "custom")}
            >
              Use A Custom Description
            </Button>
            <Button
              variant={activeSection === "filters" ? "default" : "outline"}
              onClick={() => setActiveSection(activeSection === "filters" ? null : "filters")}
            >
              Use Filters
            </Button>
          </div>

          {/* Custom Description Section */}
          {activeSection === "custom" && (
            <div className="flex flex-col gap-4 mt-2 border p-4 rounded-md">
              <label htmlFor="customDescription" className="text-sm font-medium">
                Custom Description
              </label>
              <Textarea
                id="customDescription"
                placeholder="Write your custom description here..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="h-40 w-full resize-none"
              />
              <Button onClick={handleSubmit}>Submit Rollup</Button>
            </div>
          )}

          {/* Filters Section */}
          {activeSection === "filters" && (
            <div className="flex flex-col gap-6 mt-2 border p-4 rounded-md">
              {/* Industry */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="No Preference"
                  className="border rounded-md p-2"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="No Preference"
                  className="border rounded-md p-2"
                />
              </div>

              {/* Revenue Range */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Revenue Range ($)</label>
                <div className="flex gap-2 items-center">
                  <span className="w-8 text-sm">Min</span>
                  <Slider
                    value={[revenueRange[0]]}
                    onValueChange={(val) =>
                      setRevenueRange([Math.min(val[0], revenueRange[1]), revenueRange[1]])
                    }
                    min={0}
                    max={10000000}
                    step={100000}
                    className="flex-1"
                  />
                  <span>${revenueRange[0].toLocaleString()}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-8 text-sm">Max</span>
                  <Slider
                    value={[revenueRange[1]]}
                    onValueChange={(val) =>
                      setRevenueRange([revenueRange[0], Math.max(val[0], revenueRange[0])])
                    }
                    min={0}
                    max={10000000}
                    step={100000}
                    className="flex-1"
                  />
                  <span>${revenueRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Strategic Focus */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Strategic Focus</label>
                {["Market Power", "Economies of Scale", "Operational Strategies", "Potential Growth"].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={strategicFocus.includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>

              {/* Target EBITDA Margin Range */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Target EBITDA Margin Range (%)</label>
                <div className="flex gap-2 items-center">
                  <span className="w-8 text-sm">Min</span>
                  <Slider
                    value={[ebitdaRange[0]]}
                    onValueChange={(val) =>
                      setEbitdaRange([Math.min(val[0], ebitdaRange[1]), ebitdaRange[1]])
                    }
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span>{ebitdaRange[0]}%</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-8 text-sm">Max</span>
                  <Slider
                    value={[ebitdaRange[1]]}
                    onValueChange={(val) =>
                      setEbitdaRange([ebitdaRange[0], Math.max(val[0], ebitdaRange[0])])
                    }
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span>{ebitdaRange[1]}%</span>
                </div>
              </div>

              <Button onClick={handleSubmit}>Submit Rollup</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
