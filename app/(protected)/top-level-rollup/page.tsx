"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ExternalLink, 
  Building2, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  Mail,
  Phone,
  Linkedin,
  Star
} from "lucide-react";

interface Candidate {
  id: string;
  score: number;
  askingPrice: number;
  bitrixStatus: string;
  brokerage: string;
  business_strategy: string;
  chunk_text?: string;
  companyLocation?: string;
  location?: string;
  confidence_business_strategy: number;
  confidence_growth_stage: number;
  createdAt: string;
  dealTeaser?: string;
  dealCaption: string;
  description?: string;
  ebitda: number;
  ebitdaMargin: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  grossRevenue: number;
  growth_stage: string;
  industry: string;
  linkedinUrl?: string;
  name: string;
  revenue: number;
  sourceWebsite?: string;
  title: string;
  updatedAt: string;
  workPhone?: string;
}

export default function TopLevelRollupResults() {
  const [deals, setDeals] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<{pg: boolean, redis: boolean} | null>(null);
  const [filters, setFilters] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get filters and results from sessionStorage
    const storedFilters = sessionStorage.getItem('portfolioRollupFilters');
    const storedResults = sessionStorage.getItem('portfolioRollupResults');
    
    if (storedResults) {
      try {
        const results = JSON.parse(storedResults);
        setDeals(results.candidates || []);
        setSummary(results.summary || '');
        
        if (results.dbStatus) {
          setDbStatus({
            pg: results.dbStatus.postgresql?.connected || false,
            redis: results.dbStatus.redis?.connected || false
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error parsing stored results:', error);
        setError('Failed to load results');
        setLoading(false);
      }
    } else {
      setError('No results found. Please run the analysis again.');
      setLoading(false);
    }

    if (storedFilters) {
      try {
        setFilters(JSON.parse(storedFilters));
      } catch (error) {
        console.error('Error parsing stored filters:', error);
      }
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return "bg-green-100 text-green-800";
      case 'pending':
      case 'under_contract':
        return "bg-yellow-100 text-yellow-800";
      case 'sold':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

if (loading) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio analysis...</p>
        </div>
      </div>
    </div>
  );  
}    

if (error) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );  
}

if (!deals || deals.length === 0) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h1>
        <p className="text-gray-600 mb-6">No deals match your criteria.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Top-Level Rollup Results</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-600">Found {deals.length} potential acquisition targets</p>
            {dbStatus && (
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${dbStatus.pg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>DB: {dbStatus.pg ? 'Connected' : 'Failed'}</span>
                <span className={`w-2 h-2 rounded-full ${dbStatus.redis ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>Cache: {dbStatus.redis ? 'Connected' : 'Failed'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              AI Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Candidates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {deals.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{candidate.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {candidate.dealTeaser || candidate.dealCaption}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(candidate.bitrixStatus)}>
                  {candidate.bitrixStatus}
                </Badge>
              </div>
              
              {/* Score and Confidence */}
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Match: {(candidate.score * 100).toFixed(1)}%
                </Badge>
                <Badge className={`text-xs ${getConfidenceColor(candidate.confidence_business_strategy)}`}>
                  Strategy: {(candidate.confidence_business_strategy * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Revenue</span>
                  </div>
                  <p className="text-lg font-semibold">{formatCurrency(candidate.revenue)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">EBITDA</span>
                  </div>
                  <p className="text-lg font-semibold">{formatCurrency(candidate.ebitda)}</p>
                  <p className="text-sm text-gray-600">{formatPercentage(candidate.ebitdaMargin)} margin</p>
                </div>
              </div>

              <Separator />

              {/* Company Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span>{candidate.industry}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{candidate.location || candidate.companyLocation}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {candidate.business_strategy}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {candidate.growth_stage}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Asking Price */}
              {candidate.askingPrice && (
                <>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Asking Price</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(candidate.askingPrice)}</p>
                    <p className="text-xs text-gray-600">via {candidate.brokerage}</p>
                  </div>
                </>
              )}

              {/* Contact Information */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Contact: {candidate.name}</p>
                <div className="flex gap-2">
                  {candidate.email && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  )}
                  {candidate.workPhone && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {candidate.linkedinUrl && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Linkedin className="h-4 w-4 mr-1" />
                      LinkedIn
                    </Button>
                  )}
                  {candidate.sourceWebsite && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Listing
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );}
