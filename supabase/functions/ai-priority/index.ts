
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

    const { complaintText, category, attachmentUrl, source } = await req.json();

    if (!complaintText && !attachmentUrl) {
      return new Response(
        JSON.stringify({ error: "Missing complaint text or attachment" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing ${category} complaint for priority determination`);
    console.log(`Content: ${complaintText?.substring(0, 100)}${complaintText?.length > 100 ? '...' : ''}`);
    console.log(`Source: ${source}, Attachment: ${attachmentUrl ? 'Yes' : 'No'}`);

    // Enhanced context for the AI to better determine priority
    const emergencyKeywords = {
      water: [
        "leak", "burst pipe", "flooding", "no water", "contamination", 
        "sewage", "overflow", "blocked drain", "water quality", "health hazard",
        "emergency", "urgent", "immediate", "dangerous", "unsafe"
      ],
      energy: [
        "power outage", "electric shock", "fire hazard", "exposed wire", "sparks", 
        "transformer", "blackout", "down line", "broken pole", "smoke", 
        "emergency", "urgent", "immediate", "dangerous", "unsafe"
      ],
    };

    // Create a more comprehensive prompt for the AI
    const prompt = `
    You are an AI assistant for the PCMC (Pimpri Chinchwad Municipal Corporation) Smart City initiative.
    Analyze the following ${category} complaint and determine its priority level.
    
    PRIORITY LEVELS EXPLAINED:
    - HIGH: Issues posing immediate risk to public safety, health, or infrastructure. Requires immediate attention (0-24 hours).
      Examples: Burst water mains, sewage overflow into drinking water, exposed electrical wires, transformers on fire.
    
    - MEDIUM: Issues causing significant inconvenience but not immediate danger. Should be addressed soon (1-3 days).
      Examples: Low water pressure, intermittent power outages, billing errors affecting service.
    
    - LOW: Minor issues or general inquiries that can be scheduled for routine maintenance (3+ days).
      Examples: General inquiries, future billing concerns, minor cosmetic issues with infrastructure.

    COMPLAINT SOURCE: ${source}
    ${attachmentUrl ? `ATTACHMENT INCLUDED: Yes` : ''}
    COMPLAINT ABOUT ${category.toUpperCase()} SERVICES: ${complaintText}
    
    Respond with ONLY one of the following: "high", "medium", or "low"
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
          temperature: 0.1,
          maxOutputTokens: 50
        }
      })
    });

    const data = await response.json();
    
    // Apply fallback logic with keyword analysis if AI fails
    let priority = "medium"; // Default fallback
    
    try {
      // Extract the priority from the AI response
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
      } else {
        // Fallback to keyword analysis if AI response is not what we expected
        const relevantKeywords = emergencyKeywords[category] || [];
        const textToAnalyze = complaintText.toLowerCase();
        let highPriorityMatches = 0;
        
        for (const keyword of relevantKeywords) {
          if (textToAnalyze.includes(keyword)) {
            highPriorityMatches++;
          }
        }
        
        if (highPriorityMatches >= 3) {
          priority = "high";
        } else if (highPriorityMatches >= 1) {
          priority = "medium";
        } else {
          priority = "low";
        }
      }
    } catch (error) {
      console.error("Error extracting priority from AI response:", error);
      
      // Even more robust fallback with basic text analysis
      const textLower = complaintText.toLowerCase();
      if (textLower.includes("urgent") || 
          textLower.includes("emergency") || 
          textLower.includes("immediate") || 
          textLower.includes("danger")) {
        priority = "high";
      } else if (textLower.includes("soon") || 
                textLower.includes("problem") || 
                textLower.includes("issue")) {
        priority = "medium";
      } else {
        priority = "low";
      }
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
      JSON.stringify({ error: error.message, priority: "medium" }), // Return medium as fallback
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 with fallback rather than 500 to avoid blocking complaint submission
      }
    );
  }
});
