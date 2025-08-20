"use server";

import { openai, openaiClient } from "@/lib/ai/available-models";
import prismaDB from "@/lib/prisma";
import { splitContentIntoChunks } from "@/lib/utils";
import { generateObject, generateText } from "ai";
import { z } from "zod";

/**
 * Evaluates a deal against a screener
 * @param dealId - The ID of the deal to evaluate
 * @param screenerId - The ID of the screener to use for evaluation
 * @returns The evaluation result
 */
export async function evaluateDeal(dealId: string, screenerId: string) {
  const fetchedDealInformation = await prismaDB.deal.findFirst({
    where: {
      id: dealId,
    },
    select: {
      id: true,
      title: true,
      dealCaption: true,
      dealTeaser: true,
      askingPrice: true,
      dealType: true,
      grossRevenue: true,
      tags: true,
      brokerage: true,
      ebitdaMargin: true,
      ebitda: true,
      revenue: true,
    },
  });

  if (!fetchedDealInformation) {
    return {
      success: false,
      error: "Deal not found",
    };
  }

  try {
    const screener = await prismaDB.screener.findFirst({
      where: {
        id: screenerId,
      },
    });

    if (!screener) {
      return {
        success: false,
        error: "Screener not found",
      };
    }

    const chunks = await splitContentIntoChunks(screener.content);
    const totalChunks = chunks.length;
    console.log("total chunks", totalChunks);

    const intermediateSummaries = [];

    for (const chunk of chunks) {
      const summary = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `Evaluate this listing ${JSON.stringify(
          fetchedDealInformation,
        )}: ${chunk}`,
      });
      console.log("pushing chunk evaluation", summary.text);
      intermediateSummaries.push(summary.text);
    }
    const combinedSummary = intermediateSummaries.join(
      "\n\n=== Next Section ===\n\n",
    );

    console.log(combinedSummary);

    let finalSummary;

    try {
      finalSummary = await generateObject({
        model: openai("gpt-4o-mini"),
        prompt: `Combine the following summaries into a single summary: ${combinedSummary}`,
        schema: z.object({
          title: z.string(),
          score: z.number(),
          sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
          explanation: z.string(),
        }),
      });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Error generating summary",
      };
    }

    console.log("finalSummary", finalSummary);

    return {
      success: true,
      title: finalSummary?.object?.title,
      score: finalSummary?.object?.score,
      sentiment: finalSummary?.object?.sentiment,
      explanation: finalSummary?.object?.explanation,
      content: combinedSummary,
    };
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
