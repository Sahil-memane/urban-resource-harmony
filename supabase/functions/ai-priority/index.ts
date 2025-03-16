
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const { complaintText, category } = await req.json();

    if (!complaintText) {
      return new Response(
        JSON.stringify({ error: "Missing complaint text" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Processing complaint for priority determination:", complaintText);

    // Call Gemini AI to determine priority
    const prompt = `
    Based on the following complaint about ${category} services, determine the priority level (low, medium, or high).
    Consider the severity of the issue, potential impact on citizens, and urgency for resolution.
    
    Complaint: ${complaintText}
    
    Respond with ONLY one of the following: "low", "medium", or "high"
    `;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 100
        }
      })
    });

    const data = await response.json();
    
    let priority = "medium"; // Default fallback
    
    try {
      // Extract the priority from the response
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text.trim().toLowerCase();
        if (["low", "medium", "high"].includes(text)) {
          priority = text;
        } else {
          // If the response doesn't match expected format, try to extract it
          if (text.includes("low")) priority = "low";
          else if (text.includes("high")) priority = "high";
          else priority = "medium";
        }
      }
    } catch (error) {
      console.error("Error extracting priority from AI response:", error);
    }

    console.log("Determined priority:", priority);
    return new Response(
      JSON.stringify({ priority }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in AI priority function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
