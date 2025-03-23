
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

    // Initial keyword-based priority check (fast path for obvious emergencies)
    const emergencyKeywords = [
      "urgent", "emergency", "immediate", "dangerous", "hazard", "risk", 
      "life-threatening", "fire", "flood", "leakage", "burst", "contamination", 
      "sick", "health", "live wire", "sparking", "danger", "critical", "severe",
      "unsafe", "toxic", "exposed", "electrical shock", "drowning"
    ];
    
    // Check if complaint has clear emergency indicators
    const textLower = (complaintText || "").toLowerCase();
    const isUrgentByKeywords = emergencyKeywords.some(keyword => textLower.includes(keyword));
    
    // If complaint is very short (1-3 characters) and not clearly an emergency, 
    // default to medium without calling the AI
    if (complaintText && complaintText.length <= 3 && !isUrgentByKeywords) {
      console.log("Very short complaint, assigning default medium priority");
      return new Response(
        JSON.stringify({ priority: "medium" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Immediate high priority for complaints with capitalized "URGENT" or "EMERGENCY"
    if (textLower.includes("urgent") || textLower.includes("emergency")) {
      const hasCapitalizedUrgent = complaintText?.includes("URGENT") || complaintText?.includes("EMERGENCY");
      if (hasCapitalizedUrgent) {
        console.log("Found capitalized URGENT or EMERGENCY, immediately assigning high priority");
        return new Response(
          JSON.stringify({ priority: "high" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    // Load appropriate examples from the sample complaints based on category
    let categorySpecificExamples = "";
    if (category === "water") {
      categorySpecificExamples = `
      HIGH PRIORITY EXAMPLES:
      - "Burst water main on Alandi Road near Shivar Chowk. Water flooding the street and causing traffic disruption."
      - "No water supply in entire G Block, Pimpri for the last 24 hours. Multiple residents affected including elderly and infants."
      - "Contaminated water with strong smell coming from taps in Sector 25, Nigdi. Water appears brownish and has foul odor."
      - "Water leakage flooding basement parking of our building, risk of electrical short circuit."
      - "Sewage mixing with drinking water in our society, people falling sick."
      - "Main water line broken near Sector 10, water gushing onto road creating hazard"
      - "Water contamination causing illness in multiple households in our society"
      
      MEDIUM PRIORITY EXAMPLES:
      - "Low water pressure in D Wing, Krushna Housing Society for the past 2 days. Only getting water on ground floor."
      - "Intermittent water supply in Sector 18, PCNTDA. Water comes only for 30 minutes instead of scheduled 2 hours."
      - "Water meter showing incorrect readings at 45/2 Pimpri Housing Society. Bill amount almost doubled from previous month."
      - "Water connection was supposed to be installed last week but work not completed yet."
      - "Brown water coming from taps occasionally, not constant"
      
      LOW PRIORITY EXAMPLES:
      - "Need information on water supply schedule during the upcoming Ganesh festival."
      - "Water bill payment website not working properly. Unable to make online payment."
      - "Request for water quality report for Chinchwad area. Is the hardness level within acceptable limits?"
      - "Looking for information about how to apply for new water connection."
      - "Small drip from bathroom tap, not urgent"
      `;
    } else if (category === "energy") {
      categorySpecificExamples = `
      HIGH PRIORITY EXAMPLES:
      - "Live wire fallen on road in Akurdi near Dmart. Extremely dangerous situation."
      - "Transformer sparking and smoking in Morwadi, Pimpri. Risk of fire to nearby buildings."
      - "Complete power outage in Sector 27, Nigdi for over 12 hours. Multiple residential societies affected."
      - "Electric pole leaning dangerously after last night's storm, may fall any time."
      - "Frequent power surges damaging appliances and risk of fire in our building."
      - "Exposed wires in children's playground area, immediate danger"
      - "Burning smell from electric meter box in our building"
      
      MEDIUM PRIORITY EXAMPLES:
      - "Frequent power fluctuations damaging appliances in our building in Chinchwad East."
      - "Street lights not working on the entire stretch of Aundh Road, causing safety concerns at night."
      - "Power outage in specific wing of our society while other wings have electricity."
      - "Electricity meter appears to be running fast, showing excess consumption."
      - "Flickering streetlights in our area for past week"
      
      LOW PRIORITY EXAMPLES:
      - "Need information about solar panel installation procedure and subsidies offered by PCMC."
      - "Want to understand peak hour electricity rates for small businesses."
      - "Request for information on upcoming maintenance schedule in Bhosari area."
      - "Question about electricity bill calculation methodology."
      - "One streetlight not working in our lane"
      `;
    }

    // Create a more comprehensive and detailed prompt for the AI
    const prompt = `
    You are an AI assistant for the PCMC (Pimpri Chinchwad Municipal Corporation) Smart City initiative.
    Your task is to analyze the following ${category} complaint and determine its priority level based on severity, impact, and urgency.
    I need you to return ONLY "high", "medium", or "low" as your answer, nothing else.
    
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
    
    Emergency keywords to look for: urgent, immediate, dangerous, hazard, risk, emergency, life-threatening, fire, flood, leakage, burst, contamination, sick, health, live wire, sparking, outage, no supply.
    
    Consider the following in your analysis:
    1. Is there an immediate health or safety risk?
    2. How many people are affected?
    3. Is essential service completely disrupted or just diminished?
    4. Is there property damage or environmental harm?
    5. Are vulnerable populations (elderly, children, hospitals) affected?
    6. Does the complaint contain any emergency keywords?
    7. Is the complaint about a complete service outage or just partial disruption?
    
    Respond with ONLY one of the following words, with no other text or explanation whatsoever: "high", "medium", or "low"
    `;

    // Skip AI call if the text is extremely short and not a clear emergency
    if (complaintText && complaintText.length <= 5 && !isUrgentByKeywords) {
      console.log("Very short non-emergency complaint, skipping AI call");
      return new Response(
        JSON.stringify({ priority: "medium" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log("Calling Gemini API for priority assessment");
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
        console.log("Raw AI response:", text);
        
        if (["low", "medium", "high"].includes(text)) {
          priority = text;
        } else {
          // If the response doesn't match expected format exactly, try to extract it
          if (text.includes("high")) priority = "high";
          else if (text.includes("low")) priority = "low";
          else priority = "medium";
        }
      } else {
        console.warn("No valid response from AI, using fallback priority detection");
        
        // Enhanced keyword analysis as fallback
        if (isUrgentByKeywords) {
          priority = "high";
          console.log("Emergency keywords detected, setting high priority");
        } else {
          // More detailed text analysis
          const emergencyPatterns = {
            water: [
              /burst\s+(?:water\s+)?(?:pipe|main)/i, // Burst pipes/mains
              /flood/i, // Flooding situations
              /no\s+water\s+(?:supply|service)/i, // No water supply
              /contamina(?:ted|tion)/i, // Contamination issues
              /leak(?:age|ing)\s+(?:severe|major|big|large)/i, // Major leaks
              /sewage\s+(?:in|mixing)/i, // Sewage issues
              /water\s+(?:quality|unsafe|undrinkable)/i, // Water quality
              /brown|yellow|cloudy\s+water/i, // Discolored water
              /(?:foul|bad)\s+(?:smell|odor)/i, // Bad smell in water
            ],
            energy: [
              /(?:live|exposed|broken|down)\s+(?:wire|cable)/i, // Exposed wires
              /electric(?:al)?\s+(?:shock|hazard)/i, // Electrical hazards
              /(?:transformer|pole)\s+(?:fire|burning|smoke|fallen|down)/i, // Transformer issues
              /(?:complete|total)\s+(?:power\s+)?outage/i, // Complete outages
              /no\s+electricity|no\s+power/i, // No electricity
              /fire\s+(?:risk|hazard)/i, // Fire risks
              /spark(?:ing|s)/i, // Sparking
              /(?:burn(?:ing|t)|smoke)/i, // Burning or smoke
            ],
          };

          let severityScore = 0;
          
          // Check for category-specific emergency patterns
          if (category in emergencyPatterns) {
            for (const pattern of emergencyPatterns[category]) {
              if (pattern.test(textLower)) {
                severityScore += 2;
                console.log(`Emergency pattern matched: ${pattern}, score +2`);
              }
            }
          }
          
          // Check general emergency patterns
          if (/urgent|emergency|immediate|asap/i.test(textLower)) severityScore += 2;
          if (/dangerous|hazard|risk|safety/i.test(textLower)) severityScore += 2;
          if (/child(?:ren)?|elderly|hospital|school/i.test(textLower)) severityScore += 1; // Vulnerable populations
          if (/many|multiple|entire|all|everyone|whole/i.test(textLower)) severityScore += 1; // Many affected
          if (/since\s+\d+\s+(?:hour|day|week)/i.test(textLower)) severityScore += 1; // Long duration
          if (/damage(?:d|s)?|destroy(?:ed|s)?/i.test(textLower)) severityScore += 1; // Property damage
          
          // Determine priority based on score
          if (severityScore >= 3) {
            priority = "high";
          } else if (severityScore >= 1) {
            priority = "medium";
          } else {
            priority = "low";
          }
          
          console.log(`Fallback severity score: ${severityScore}, assigned priority: ${priority}`);
        }
      }
    } catch (error) {
      console.error("Error extracting priority from AI response:", error);
      
      // Even more robust fallback with basic text analysis
      const textLower = complaintText?.toLowerCase() || '';
      if (
        textLower.includes("urgent") || 
        textLower.includes("emergency") || 
        textLower.includes("immediate") || 
        textLower.includes("dangerous") || 
        textLower.includes("hazard") || 
        textLower.includes("health") || 
        textLower.includes("safety") ||
        textLower.includes("no water") ||
        textLower.includes("burst") ||
        textLower.includes("leakage") ||
        textLower.includes("flooding") ||
        textLower.includes("live wire") ||
        textLower.includes("fire") ||
        textLower.includes("risk")
      ) {
        priority = "high";
      } else if (
        textLower.includes("problem") || 
        textLower.includes("issue") || 
        textLower.includes("not working") || 
        textLower.includes("broken") ||
        textLower.includes("interrupted") ||
        textLower.includes("intermittent")
      ) {
        priority = "medium";
      } else {
        priority = "low";
      }
      
      console.log("Using emergency keyword fallback, assigned priority:", priority);
    }

    console.log("Final determined priority:", priority);
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
