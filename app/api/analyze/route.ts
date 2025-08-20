import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { RulesEngineObjectSchema } from "@/lib/zod-schemas/rules-schemas";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const userSession = await auth();

  if (!userSession?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("pdf") as File;

  // Convert the file's arrayBuffer to a Base64 data URL
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert Uint8Array to an array of characters
  const charArray = Array.from(uint8Array, (byte) => String.fromCharCode(byte));
  const binaryString = charArray.join("");
  const base64Data = btoa(binaryString);
  const fileDataUrl = `data:application/pdf;base64,${base64Data}`;

  const result = await generateObject({
    model: openai("gpt-4.1"),
    messages: [
      {
        role: "system",
        content:
          "You are a specialized AI that converts business criteria into a machine-readable JSON rules object. Your task is to analyze the provided screening criteria and generate a JSON object that strictly adheres to the schema below. **Instructions:**- Identify the key metrics (facts) such as `deal_value`, `geography`, `industry`, etc.- Map the logical operators from the document (e.g., 'greater than', 'and', 'cannot be') to their JSON equivalents (`greaterThan`, `all`, `notEqual`).- Ensure the output is a single, valid JSON object that matches the schema exactly.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze the following PDF and generate a JSON object that strictly adheres to the schema below.",
          },
          {
            type: "file",
            data: fileDataUrl,
            mediaType: "application/pdf",
          },
        ],
      },
    ],
    schema: RulesEngineObjectSchema,
  });

  return Response.json(result.object);
}
