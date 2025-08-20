import { openai } from "@/lib/ai/available-models";
import { weatherTool } from "@/lib/ai/tools/weather";
import { stockTool } from "@/lib/ai/tools/stock";
import { streamText } from "ai";

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a friendly assistant!",
    messages,
    maxSteps: 5,
    tools: {
      displayWeather: weatherTool,
      getStockPrice: stockTool,
    },
  });

  return result.toUIMessageStreamResponse();
}
