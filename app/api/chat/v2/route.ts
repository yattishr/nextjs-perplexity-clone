import { NextRequest } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set
});

// Define the structured format for AI responses
const SearchResponseSchema = z.object({
  title: z.string(), // Headline for the response
  summary: z.string(), // General summary
  links: z.array(
    z.object({
      text: z.string(),
      url: z.string(),
    })
  ), // List of clickable links
});

// Edge Runtime (optional for better performance)
export const runtime = "edge";

// Set the model to use
export const model = "gpt-4o-mini"

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 0: Detect the User Location fron the IP Address
    const ip = req.headers.get("x-forwarded-for")  || req.headers.get("cf-connecting-ip");
    let userLocation = "South Africa"; // Default location

    console.log("User IP Address:", ip);

    if (ip) { 
        try {
            const geoRes = await axios.get(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_API_KEY}`)
            if(geoRes.data.city && geoRes.data.country) {
                userLocation = `${geoRes.data.city}, ${geoRes.data.country}`
            }
        } catch (error) {
            console.error("Error fetching user location:", error);
        }
    }

    // Step 1: Fetch search results from Tavily API
    const tavilyResponse = await axios.post(
      "https://api.tavily.com/search",
      { query, 
        search_depth: "advanced",
        location: userLocation
      },
      { headers: { Authorization: `Bearer ${process.env.TAVILY_API_KEY}` } }
    );

    const results = tavilyResponse.data.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      snippet: result.snippet,
    }));

    // Step 2: Get structured AI response
    const aiResponse = await openai.beta.chat.completions.parse({
      model: model,
      messages: [
        { role: "system", content: "Summarize the search results into a structured response with a title, summary, and useful links." },
        { role: "user", content: `Here are the search results: ${JSON.stringify(results)}` },
      ],
      response_format: zodResponseFormat(SearchResponseSchema, "search_summary"), // Ensures a structured output
    });

    const structuredResponse = aiResponse.choices[0].message.parsed;

    return new Response(JSON.stringify(structuredResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error fetching data:", error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch search results", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}