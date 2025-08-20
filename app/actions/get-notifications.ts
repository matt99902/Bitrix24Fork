"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openai = createOpenAI({
  // custom settings, e.g.
  apiKey: process.env.AI_API_KEY
});

export default async function getNotifications(input: string) {
  "use server";

  const { object: notifications } = await generateObject({
    model: openai("gpt-4o"),
    system: "You generate three notifications for a messages app.",
    prompt: input,
    schema: z.object({
      notifications: z.array(
        z.object({
          name: z.string().describe("Name of a fictional person."),
          message: z.string().describe("Do not use emojis or links."),
          minutesAgo: z.number(),
        }),
      ),
    }),
  });

  return { notifications };
}
