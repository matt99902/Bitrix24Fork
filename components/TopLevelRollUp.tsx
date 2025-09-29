"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { ChevronUp, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// Hook for finding screen size
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function TopLevelRollup() {
  const [customDescription, setCustomDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [revenueRange, setRevenueRange] = useState<[number, number]>([0, 10000000]);
  const [ebitdaRange, setEbitdaRange] = useState<[number, number]>([0, 50]);
  const [strategicFocus, setStrategicFocus] = useState<string[]>([]);
  const [portfolioSize, setPortfolioSize] = useState<[number, number]>([5, 20]);
  const [timeframe, setTimeframe] = useState("12");
  const [isLoading, setIsLoading] = useState(false);
  const [useCustom, setUseCustom] = useState(false);

  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleCheckboxChange = (value: string) => {
    setStrategicFocus((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    const rollupPayload = useCustom 
      ? {
          type: "custom",
          description: customDescription
        }
      : {
          type: "filters",
          industry: industry || null,
          location: location || null,
          revenueMin: revenueRange[0],
          revenueMax: revenueRange[1],
          ebitdaMarginMin: ebitdaRange[0],
          ebitdaMarginMax: ebitdaRange[1],
          strategicFocus: strategicFocus.length > 0 ? strategicFocus : null,
          portfolioSize: portfolioSize,
          timeframe: parseInt(timeframe)
        };
    
    console.log("Top-Level Rollup Payload:", rollupPayload);

    setIsLoading(true);

    try {
      // call to backend API endpoint
      const response = await fetch('/api/top-level-rollup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rollupPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rollup data');
      }

      const rollupData = await response.json();
      
      // Store the results in sessionStorage to pass to results page
      sessionStorage.setItem('portfolioRollupResults', JSON.stringify(rollupData));
      
      // Navigate to results page
      router.push('/top-level-rollup');
      
    } catch (error) {
      console.error('Error performing rollup:', error);
      setIsLoading(false);
      // Error message to show to user could go here if needed 
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Analyzing Portfolio Companies...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  const RollupContent = (
    <div className="max-h-[80vh] overflow-y-auto flex flex-col gap-6 p-4">
      {/* Method Selection */}
      <div className="flex gap-4 mb-4">
        <Button
          variant={!useCustom ? "default" : "outline"}
          onClick={() => setUseCustom(false)}
          className="flex-1"
        >
          Use Filters
        </Button>
        <Button
          variant={useCustom ? "default" : "outline"}
          onClick={() => setUseCustom(true)}
          className="flex-1"
        >
          Custom Strategy
        </Button>
      </div>

      {useCustom ? (
        /* Custom Description Section */
        <div className="flex flex-col gap-4 border p-4 rounded-md bg-gray-50/50">
          <div className="flex flex-col gap-2">
            <label htmlFor="customDescription" className="text-sm font-medium text-gray-700">
              Portfolio Strategy Description
            </label>
            <p className="text-xs text-gray-500">
              Describe your ideal portfolio composition and acquisition strategy
            </p>
            <Textarea
              id="customDescription"
              placeholder="e.g., Focus on SaaS companies in the Southeast with recurring revenue models, strong customer retention, and potential for operational improvements..."
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="h-32 w-full resize-none"
            />
          </div>
        </div>
      ) : (
        /* Filters Section */
        <div className="flex flex-col gap-6 border p-4 rounded-md bg-gray-50/50">
          {/* Portfolio Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Target Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., SaaS, Manufacturing, Healthcare"
                className="border rounded-md p-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Geographic Focus</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Southeast US, California"
                className="border rounded-md p-2 text-sm"
              />
            </div>
          </div>

          {/* Financial Criteria */}
          <div className="flex flex-col gap-4">
            <h4 className="font-medium text-gray-800 border-b pb-2">Financial Criteria</h4>
            
            {/* Revenue Range */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">
                Revenue Range per Company ($)
              </label>
              <div className="flex gap-2 items-center">
                <span className="w-8 text-xs">Min</span>
                <Slider
                  value={[revenueRange[0]]}
                  onValueChange={(val) =>
                    setRevenueRange([
                      Math.min(val[0], revenueRange[1]),
                      revenueRange[1],
                    ])
                  }
                  min={0}
                  max={50000000}
                  step={250000}
                  className="flex-1"
                />
                <span className="text-xs w-20">${(revenueRange[0] / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-8 text-xs">Max</span>
                <Slider
                  value={[revenueRange[1]]}
                  onValueChange={(val) =>
                    setRevenueRange([
                      revenueRange[0],
                      Math.max(val[0], revenueRange[0]),
                    ])
                  }
                  min={0}
                  max={50000000}
                  step={250000}
                  className="flex-1"
                />
                <span className="text-xs w-20">${(revenueRange[1] / 1000000).toFixed(1)}M</span>
              </div>
            </div>

            {/* EBITDA Margin Range */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">
                Target EBITDA Margin Range (%)
              </label>
              <div className="flex gap-2 items-center">
                <span className="w-8 text-xs">Min</span>
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
                <span className="text-xs w-12">{ebitdaRange[0]}%</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-8 text-xs">Max</span>
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
                <span className="text-xs w-12">{ebitdaRange[1]}%</span>
              </div>
            </div>
          </div>

          {/* Strategic Focus */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700 border-b pb-2">Strategic Focus Areas</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Market Power",
                "Economies of Scale", 
                "Operational Synergies",
                "Revenue Growth",
                "Cost Optimization",
                "Technology Integration",
                "Geographic Expansion",
                "Product Diversification"
              ].map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={strategicFocus.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                    className="rounded"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Portfolio Size */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">
              Target Portfolio Size (Number of Companies)
            </label>
            <div className="flex gap-2 items-center">
              <span className="w-8 text-xs">Min</span>
              <Slider
                value={[portfolioSize[0]]}
                onValueChange={(val) =>
                  setPortfolioSize([Math.min(val[0], portfolioSize[1]), portfolioSize[1]])
                }
                min={1}
                max={50}
                step={1}
                className="flex-1"
              />
              <span className="text-xs w-12">{portfolioSize[0]}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="w-8 text-xs">Max</span>
              <Slider
                value={[portfolioSize[1]]}
                onValueChange={(val) =>
                  setPortfolioSize([portfolioSize[0], Math.max(val[0], portfolioSize[0])])
                }
                min={1}
                max={50}
                step={1}
                className="flex-1"
              />
              <span className="text-xs w-12">{portfolioSize[1]}</span>
            </div>
          </div>

          {/* Timeframe */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Investment Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border rounded-md p-2 text-sm"
            >
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="18">18 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
            </select>
          </div>
        </div>
      )}

      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={useCustom && !customDescription.trim()}
      >
        Generate Top-Level Rollup
      </Button>
    </div>
  );

  return isDesktop ? (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Perform Top-Level Rollup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Portfolio-Level Rollup Analysis</DialogTitle>
          <DialogDescription>
            Configure parameters for analyzing potential acquisition targets across your portfolio strategy.
          </DialogDescription>
        </DialogHeader>
        {RollupContent}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="default" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Perform Top-Level Rollup
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Portfolio-Level Rollup Analysis</DrawerTitle>
          <DrawerDescription>
            Configure parameters for analyzing potential acquisition targets across your portfolio strategy.
          </DrawerDescription>
        </DrawerHeader>
        {RollupContent}
      </DrawerContent>
    </Drawer>
  );
}