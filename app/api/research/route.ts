import { openai } from "@/lib/ai/available-models";
import { getCompanyInfo } from "@/lib/ai/tools/company-info";
import { generateMemo } from "@/lib/ai/tools/generate-memo";
import { getCompetitors } from "@/lib/ai/tools/get-competitors";
import { getCompanyFinancials } from "@/lib/ai/tools/get-financials";
import { assessFounderMarketFit } from "@/lib/ai/tools/get-founder-info";
import { getFounderInfo } from "@/lib/ai/tools/get-founder-info";
import {
  NoSuchToolError,
  InvalidToolArgumentsError,
  streamText,
  tool,
  ToolInvocation,
} from "ai";
import { z } from "zod";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}

function errorHandler(error: unknown): string {
  if (error == null) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json();

    console.log("research route called", messages);

    const result = streamText({
      model: openai("gpt-4o"),
      system:
        "You are a helpful assistant that can help with a variety of tasks.",
      messages,
      maxSteps: 15,
      tools: {
        getCompanyInfo: tool({
          description: "Get information about a company",
          inputSchema: z.object({
            companyName: z.string(),
          }),
          execute: async ({ companyName }) => {
            console.log("get company info tool called", companyName);
            return await getCompanyInfo(companyName);
          },
        }),
        getCompetitors: tool({
          description: "Get competitors of a company",
          inputSchema: z.object({
            companyName: z.string(),
          }),
          execute: async ({ companyName }) => {
            console.log("get competitors tool called", companyName);
            return await getCompetitors(companyName);
          },
        }),
        getPersonInfo: tool({
          description:
            "Get information (tweets, blog posts, linkedin profile) about a person",
          inputSchema: z.object({
            name: z.string(),
          }),
          execute: async ({ name: founderName }) => {
            console.log("get person info tool called", founderName);
            return await getFounderInfo(founderName);
          },
        }),
        assessFounderMarketFit: tool({
          description: "Assess the market fit of a founder",
          inputSchema: z.object({
            founderName: z.string(),
            companyInfo: z.string(),
          }),
          execute: async ({ founderName, companyInfo }) => {
            console.log("assess founder market fit tool called", founderName);
            return await assessFounderMarketFit({ founderName, companyInfo });
          },
        }),
        getFinancialInformation: tool({
          description: "Get financial information about a company",
          inputSchema: z.object({
            companyName: z.string(),
          }),
          execute: async ({ companyName }) => {
            console.log("get financial information tool called", companyName);
            return await getCompanyFinancials(companyName);
          },
        }),
        generateInvestmentPitch: tool({
          description: "Generate an investment pitch for a company",
          inputSchema: z.object({
            companyName: z.string(),
            companyInfo: z.string(),
            competitors: z.array(z.string()),
            founderInfo: z.string(),
            financialInfo: z.string(),
          }),
          execute: async ({
            companyName,
            companyInfo,
            competitors,
            founderInfo,
            financialInfo,
          }) => {
            console.log("generate investment pitch tool called", companyName);
            return await generateMemo(
              companyName,
              JSON.stringify({
                companyInfo,
                competitors,
                founderInfo,
                financialInfo,
              }),
            );
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      getErrorMessage: (error) => {
        if (NoSuchToolError.isInstance(error)) {
          console.log("NoSuchToolError", error);
          return "The model tried to call a unknown tool.";
        } else if (InvalidToolArgumentsError.isInstance(error)) {
          console.log("InvalidToolArgumentsError", error);
          return "The model called a tool with invalid arguments.";
        } else {
          console.log("Unknown error", error);
          return "An unknown error occurred.";
        }
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);

    if (NoSuchToolError.isInstance(error)) {
      return new Response(JSON.stringify({ error: "Invalid tool requested" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else if (InvalidToolArgumentsError.isInstance(error)) {
      return new Response(JSON.stringify({ error: "Invalid tool arguments" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({
          error: "An error occurred while processing your request",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }
}
