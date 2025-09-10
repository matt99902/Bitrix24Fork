import { generateText } from "ai";
import { google } from "@/lib/ai/available-models";
import { id } from "zod/v4/locales";
import { title } from "process";
import { ContextOptionsModelFromJSON } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/assistant_data";

export async function summarizeRollup(criteria: any, candidates: any[]) {
  const deals = candidates.slice(0, 5).map(d => ({
    id: d.id,
    title: d.title,
    industry: d.industry,
    location: d.companyLocation,
    revenue: d.revenue,
    ebitdaMargin: d.ebitdaMargin,
    businessStrategy: d.business_strategy,
    growthStage: d.growth_stage,
    dealCaption: d.dealCaption,
    askingPrice: d.askingPrice,
  }));
  const prompt = `
You are a private equity analyst. Provide a Medium analysis (1-2 paragraphs): 300-500 tokens for the following candidate deals for a roll-up strategy.
- Highlight why these deals fit the criteria.
- Mention potential synergies and risks.
- Be concise and insightful.

Criteria: ${JSON.stringify(criteria)}
Deals: ${JSON.stringify(deals)}
  `;

  const result = await generateText({
    model: google("gemini-2.5-flash"),
    prompt,
    temperature: 0.6,
    maxOutputTokens: 800,
  });
  console.log("Finishing reason:", result.finishReason);
  console.log("Total usage:", result.totalUsage);
  console.log("Steps:", result.steps);
  console.log("Usage:", result.usage);

  return result.text;
}