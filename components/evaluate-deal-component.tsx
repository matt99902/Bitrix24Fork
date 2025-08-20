"use client";

import React, { useTransition, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { evaluateDeal } from "@/app/actions/evaluate-deal";
import { saveEvaluation } from "@/app/actions/save-evaluation";
import { CheckCircle, XCircle, AlertCircle, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DealEvaluation {
  success: boolean;
  title?: string;
  score?: number;
  sentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  explanation?: string;
  content?: string;
  error?: string;
  message?: string;
}

const EvaluateDealComponent = ({
  dealId,
  screenerId,
}: {
  dealId: string;
  screenerId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [dealEvaluation, setDealEvaluation] = useState<DealEvaluation | null>(
    null,
  );
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const { toast } = useToast();

  const dealEvaluationHandler = () => {
    startTransition(async () => {
      const result = await evaluateDeal(dealId, screenerId);
      console.log("result", result);
      setDealEvaluation(result);
      setSaveResult(null); // Reset save result when new evaluation is done
    });
  };

  const saveEvaluationHandler = async () => {
    if (!dealEvaluation || !dealEvaluation.success) {
      toast({
        title: "Error",
        description: "No valid evaluation to save",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveEvaluation(dealId, dealEvaluation, screenerId);
      setSaveResult(result);

      if (result.success) {
        toast({
          title: "Success",
          description: "Evaluation saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save evaluation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "POSITIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "NEGATIVE":
        return "bg-red-100 text-red-800 border-red-200";
      case "NEUTRAL":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "POSITIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "NEGATIVE":
        return <XCircle className="h-4 w-4" />;
      case "NEUTRAL":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={dealEvaluationHandler}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Evaluating...
          </>
        ) : (
          "Evaluate Deal"
        )}
      </Button>

      {dealEvaluation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Evaluation Results
              {dealEvaluation.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!dealEvaluation.success ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {dealEvaluation.error ||
                    dealEvaluation.message ||
                    "An error occurred during evaluation"}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {dealEvaluation.title && (
                  <div>
                    <h3 className="text-lg font-semibold">
                      {dealEvaluation.title}
                    </h3>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {dealEvaluation.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Score:</span>
                      <Badge variant="outline" className="text-lg font-bold">
                        {dealEvaluation.score}/10
                      </Badge>
                    </div>
                  )}

                  {dealEvaluation.sentiment && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Sentiment:</span>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 ${getSentimentColor(dealEvaluation.sentiment)}`}
                      >
                        {getSentimentIcon(dealEvaluation.sentiment)}
                        {dealEvaluation.sentiment}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={saveEvaluationHandler}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Evaluation
                      </>
                    )}
                  </Button>

                  {saveResult && (
                    <Badge
                      variant={saveResult.success ? "default" : "destructive"}
                      className="flex items-center gap-1"
                    >
                      {saveResult.success ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {saveResult.success ? "Saved" : "Save Failed"}
                    </Badge>
                  )}
                </div>

                {dealEvaluation.explanation && (
                  <div>
                    <h4 className="mb-2 font-medium">Explanation:</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dealEvaluation.explanation}
                    </p>
                  </div>
                )}

                {dealEvaluation.content && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      View Detailed Analysis
                    </summary>
                    <div className="mt-2 rounded-md bg-muted p-3">
                      <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                        {dealEvaluation.content}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EvaluateDealComponent;
