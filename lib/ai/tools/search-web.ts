import { exa, openai } from "../available-models";
import { generateObject, generateText, tool } from "ai";
import { z } from "zod";

type SearchResult = {
  title: string;
  url: string;
  content: string;
};

const searchWebUsingEXA = async (query: string) => {
  const { results } = await exa.searchAndContents(query, {
    numResults: 1,
    livecrawl: "always",
  });
  return results.map(
    (r) =>
      (({
        title: r.title,
        url: r.url,
        content: r.text
      }) as SearchResult),
  );
};

const searchAndProcess = async (
  query: string,
  accumulatedSources: SearchResult[],
) => {
  const pendingSearchResults: SearchResult[] = [];
  const finalSearchResults: SearchResult[] = [];
  await generateText({
    model: openai("gpt-4o"),
    prompt: `Search the web for information about ${query}`,
    system:
      "You are a researcher. For each query, search the web and then evaluate if the results are relevant and will help answer the following query",
    maxSteps: 5,
    tools: {
      searchWeb: tool({
        description: "Search the web for information about a given query",
        inputSchema: z.object({
          query: z.string().min(1),
        }),
        async execute({ query }) {
          const results = await searchWebUsingEXA(query);
          pendingSearchResults.push(...results);
          return results;
        },
      }),
      evaluate: tool({
        description: "Evaluate the search results",
        inputSchema: z.object({}),
        async execute() {
          const pendingResult = pendingSearchResults.pop()!;
          const { object: evaluation } = await generateObject({
            model: openai("gpt-4o"),
            prompt: `Evaluate whether the search results are relevant and will help answer the following query: ${query}. If the page already exists in the existing results, mark it as irrelevant.
   
              <search_results>
              ${JSON.stringify(pendingResult)}
              </search_results>

               <existing_results>
            ${JSON.stringify(accumulatedSources.map((result) => result.url))}
            </existing_results>


              `,
            output: "enum",
            enum: ["relevant", "irrelevant"],
          });
          if (evaluation === "relevant") {
            finalSearchResults.push(pendingResult);
          }
          console.log("Found:", pendingResult.url);
          console.log("Evaluation completed:", evaluation);
          return evaluation === "irrelevant"
            ? "Search results are irrelevant. Please search again with a more specific query."
            : "Search results are relevant. End research for this query.";
        },
      }),
    },
  });
  return finalSearchResults;
};

const generateLearnings = async (query: string, searchResult: SearchResult) => {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    prompt: `The user is researching "${query}". The following search result were deemed relevant.
      Generate a learning and a follow-up question from the following search result:
   
      <search_result>
      ${JSON.stringify(searchResult)}
      </search_result>
      `,
    schema: z.object({
      learning: z.string(),
      followUpQuestions: z.array(z.string()),
    }),
  });
  return object;
};

export { searchAndProcess, generateLearnings, searchWebUsingEXA };
