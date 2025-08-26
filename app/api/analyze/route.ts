import { auth } from "@/auth";
import { rateLimit } from "@/lib/redis";
import { inferRawDealsSchema } from "@/lib/zod-schemas/raw-deal-schema";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

export async function POST(request: Request) {
  const userSession = await auth();

  if (!userSession?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("inside analyze route");

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const { ok, remaining, reset } = await rateLimit(
    `api:analyze:${ip}`,
    10,
    60_000,
  );

  if (!ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "RateLimit-Limit": "10",
        "RateLimit-Remaining": String(remaining),
        "RateLimit-Reset": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    });
  }

  const formData = await request.formData();
  const file = formData.get("pdf") as File;

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const charArray = Array.from(uint8Array, (byte) => String.fromCharCode(byte));
  const binaryString = charArray.join("");
  const base64Data = btoa(binaryString);
  const fileDataUrl = `data:application/pdf;base64,${base64Data}`;

  const result = await generateObject({
    model: openai("gpt-4o"),
    system: `You are a specialized business deal analyst. Your task is to extract and analyze business deals from PDF documents containing deal listings.

IMPORTANT GUIDELINES:
- Focus ONLY on business deals, business listings, or business opportunities
- Extract deals that are for sale, acquisition, or investment opportunities
- Ignore any content that is NOT related to business deals (news articles, general business information, etc.)
- If the PDF contains no business deals, return an empty array
- Each deal should be structured according to the provided schema
- Be precise with financial figures and extract them as numbers when possible

CRITICAL DATA TYPE REQUIREMENTS:
- firstName and lastName: If not available, use empty string "" instead of null
- email, linkedinUrl, workPhone: If not available, use empty string "" instead of null
- ebitda, askingPrice, ebitdaMargin, revenue, grossRevenue: If not available, use 0 instead of null
- title and industry: These are required fields - always provide meaningful values
- brokerage, companyLocation, dealTeaser: If not available, use empty string "" instead of null
- tags: If not available, use empty array [] instead of null

DEAL EXTRACTION RULES:
- Look for businesses being sold, acquired, or seeking investment
- Identify asking prices, revenue figures, EBITDA, and other financial metrics
- Extract contact information when available (names, emails, phone numbers)
- Note the source/brokerage platform and industry classification
- Provide detailed deal descriptions that capture the business opportunity
- NEVER return null values - use appropriate defaults (empty strings for text, 0 for numbers, empty arrays for tags)

Return ONLY the array of deals in the exact format specified by the schema, ensuring all required fields are present and no null values exist.`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this PDF and extract all business deals, business listings, or business opportunities. Focus only on deals that are for sale, acquisition, or investment. Ignore any other content. Extract each deal according to the specified schema and return them as an array. Remember: never return null values - use empty strings for missing text, 0 for missing numbers, and empty arrays for missing tags.",
          },
          {
            type: "file",
            data: fileDataUrl,
            mediaType: "application/pdf",
          },
        ],
      },
    ],
    schema: inferRawDealsSchema,
  });

  return Response.json(result.object);
}
