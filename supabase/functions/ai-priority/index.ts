
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

    // Load appropriate examples from the sample complaints based on category
    let categorySpecificExamples = "";
    if (category === "water") {
      categorySpecificExamples = `
      HIGH PRIORITY EXAMPLES:
      - "Burst water main on Alandi Road near Shivar Chowk. Water flooding the street and causing traffic disruption."
      - "No water supply in entire G Block, Pimpri for the last 24 hours. Multiple residents affected including elderly and infants."
      - "Contaminated water with strong smell coming from taps in Sector 25, Nigdi. Water appears brownish and has foul odor."
      
      MEDIUM PRIORITY EXAMPLES:
      - "Low water pressure in D Wing, Krushna Housing Society for the past 2 days. Only getting water on ground floor."
      - "Intermittent water supply in Sector 18, PCNTDA. Water comes only for 30 minutes instead of scheduled 2 hours."
      - "Water meter showing incorrect readings at 45/2 Pimpri Housing Society. Bill amount almost doubled from previous month."
      
      LOW PRIORITY EXAMPLES:
      - "Need information on water supply schedule during the upcoming Ganesh festival."
      - "Water bill payment website not working properly. Unable to make online payment."
      - "Request for water quality report for Chinchwad area. Is the hardness level within acceptable limits?"
      `;
    } else if (category === "energy") {
      categorySpecificExamples = `
      HIGH PRIORITY EXAMPLES:
      - "Live wire fallen on road in Akurdi near Dmart. Extremely dangerous situation."
      - "Transformer sparking and smoking in Morwadi, Pimpri. Risk of fire to nearby buildings."
      - "Complete power outage in Sector 27, Nigdi for over 12 hours. Multiple residential societies affected."
      
      MEDIUM PRIORITY EXAMPLES:
      - "Frequent power fluctuations damaging appliances in our building in Chinchwad East."
      - "Street lights not working on the entire stretch of Aundh Road, causing safety concerns at night."
      - "Power outage in specific wing of our society while other wings have electricity."
      
      LOW PRIORITY EXAMPLES:
      - "Need information about solar panel installation procedure and subsidies offered by PCMC."
      - "Want to understand peak hour electricity rates for small businesses."
      - "Request for information on upcoming maintenance schedule in Bhosari area."
      `;
    }

    // Create a more comprehensive and detailed prompt for the AI
    const prompt = `
    You are an AI assistant for the PCMC (Pimpri Chinchwad Municipal Corporation) Smart City initiative.
    Analyze the following ${category} complaint and determine its priority level based on severity, impact, and urgency.
    
    PRIORITY LEVELS EXPLAINED:
    - HIGH: Issues posing immediate risk to public safety, health, or critical infrastructure. Requires immediate attention (0-24 hours).
      Examples: Burst water mains, sewage contamination of drinking water, exposed electrical wires, transformers on fire, complete area outages.
    
    - MEDIUM: Issues causing significant inconvenience but not immediate danger. Should be addressed soon (1-3 days).
      Examples: Low water pressure, intermittent supply/outages, billing errors affecting service, localized issues.
    
    - LOW: Minor issues or general inquiries that can be scheduled for routine handling (3+ days).
      Examples: General inquiries, future billing concerns, information requests, minor cosmetic issues with infrastructure.

    ${categorySpecificExamples}
    
    COMPLAINT SOURCE: ${source}
    ${attachmentUrl ? `ATTACHMENT INCLUDED: Yes` : ''}
    COMPLAINT ABOUT ${category.toUpperCase()} SERVICES: ${complaintText}
    
    Consider the following in your analysis:
    1. Is there an immediate health or safety risk?
    2. How many people are affected?
    3. Is essential service completely disrupted or just diminished?
    4. Is there property damage or environmental harm?
    5. Are vulnerable populations (elderly, children, hospitals) affected?
    
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
        // Enhanced keyword analysis as fallback
        const emergencyKeywords = {
          water: [
            "leak", "burst pipe", "flooding", "no water", "contamination", 
            "sewage", "overflow", "blocked drain", "water quality", "health hazard",
            "emergency", "urgent", "immediate", "dangerous", "unsafe", "foul", "brown", "dirty"
          ],
          energy: [
            "power outage", "electric shock", "fire hazard", "exposed wire", "sparks", 
            "transformer", "blackout", "down line", "broken pole", "smoke", 
            "emergency", "urgent", "immediate", "dangerous", "unsafe", "electrocution"
          ],
        };
        
        const textToAnalyze = complaintText.toLowerCase();
        let highPriorityMatches = 0;
        
        for (const keyword of emergencyKeywords[category] || []) {
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
          textLower.includes("dangerous") || 
          textLower.includes("health") || 
          textLower.includes("safety")) {
        priority = "high";
      } else if (textLower.includes("problem") || 
                textLower.includes("issue") || 
                textLower.includes("not working") || 
                textLower.includes("broken")) {
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
