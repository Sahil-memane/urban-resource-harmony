import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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

    let { complaintText, category, attachmentUrl, source, attachmentContent } = await req.json();

    console.log(`[AI-PRIORITY] Processing ${category} complaint for priority determination`);
    console.log(`[AI-PRIORITY] Content: ${complaintText?.substring(0, 100)}${complaintText?.length > 100 ? '...' : ''}`);
    console.log(`[AI-PRIORITY] Source: ${source}, Attachment: ${attachmentUrl ? 'Yes' : 'No'}`);
    console.log(`[AI-PRIORITY] Attachment content extracted: ${attachmentContent ? 'Yes' : 'No'}`);

    // If no text is provided, try to use attachment content
    if (!complaintText || complaintText.trim().length === 0) {
      if (attachmentContent) {
        complaintText = `Extracted from ${source}: ${attachmentContent}`;
        console.log(`[AI-PRIORITY] Using extracted content as complaint text: ${complaintText.substring(0, 100)}...`);
      } else {
        complaintText = "(No text content provided)";
      }
    }

    // Sanitize and normalize the complaint text
    // Remove excessive whitespace, normalize case for keyword detection
    const textNormalized = complaintText.replace(/\s+/g, ' ').trim();
    const textLower = textNormalized.toLowerCase();

    // Fast direct detection for trivial complaints
    if (textLower === "hello" || textLower === "hi" || textLower === "test" || 
        textLower === "hey" || textLower === "abc" || textLower === "xyz" || 
        textLower.length < 5 || /^[a-z0-9]{1,3}$/i.test(textLower.trim())) {
      console.log("[AI-PRIORITY] Detected trivial greeting or test message, assigning LOW priority");
      return new Response(
        JSON.stringify({ priority: "low" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Fast path for complaints with "URGENT" or "EMERGENCY" in all caps
    const hasCapitalizedUrgent = 
      complaintText.includes("URGENT") || 
      complaintText.includes("EMERGENCY") || 
      complaintText.includes("URGENT!") ||
      complaintText.includes("EMERGENCY!");
      
    if (hasCapitalizedUrgent) {
      console.log("[AI-PRIORITY] Found capitalized URGENT or EMERGENCY, immediately assigning HIGH priority");
      return new Response(
        JSON.stringify({ priority: "high" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Detect significant water-related emergency patterns
    if (category === "water") {
      const waterEmergencyPatterns = [
        /burst\s+(?:water\s+)?(?:pipe|main)/i,
        /flood(?:ing)?/i,
        /no\s+water\s+(?:supply|service)?/i,
        /contaminat(?:ed|ion)/i,
        /leak(?:age|ing)\s+(?:severe|major|big|large)/i,
        /sewage|sewer\s+(?:leak|overflow|backup)/i,
        /(?:brown|yellow|dirty)\s+water/i,
        /(?:foul|bad)\s+(?:smell|odor)\s+(?:from|in)\s+water/i
      ];
      
      for (const pattern of waterEmergencyPatterns) {
        if (pattern.test(textNormalized)) {
          console.log(`[AI-PRIORITY] Water emergency pattern matched: ${pattern}`);
          return new Response(
            JSON.stringify({ priority: "high" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
      }
    }
    
    // Detect significant energy-related emergency patterns
    if (category === "energy") {
      const energyEmergencyPatterns = [
        /(?:live|exposed|broken|down|hanging)\s+(?:wire|cable|power\s+line)/i,
        /electric(?:al)?\s+(?:shock|hazard|fire)/i,
        /(?:transformer|pole|power\s+line)\s+(?:fire|burning|smoke|fallen|down|damaged)/i,
        /(?:complete|total)\s+(?:power\s+)?outage/i,
        /no\s+electricity|no\s+power/i,
        /fire\s+(?:risk|hazard)/i,
        /spark(?:ing|s)/i,
        /(?:burn(?:ing|t)|smoke)/i
      ];
      
      for (const pattern of energyEmergencyPatterns) {
        if (pattern.test(textNormalized)) {
          console.log(`[AI-PRIORITY] Energy emergency pattern matched: ${pattern}`);
          return new Response(
            JSON.stringify({ priority: "high" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
      }
    }

    // Emergency keywords - comprehensive list
    const emergencyKeywords = [
      // General emergency terms
      "urgent", "emergency", "immediate", "immediately", "critical", "dangerous", "hazard", "risk", 
      "life-threatening", "severe", "serious", "crucial", "vital", "dire", "extreme",
      
      // Water-specific emergency terms
      "burst pipe", "burst main", "flooding", "water leak", "major leak", "broken pipe", "sewage overflow",
      "contamination", "contaminated", "no water", "water outage", "water shortage", "dirty water",
      "brown water", "unsafe water", "drinking water", "water pressure", "water quality",
      
      // Energy-specific emergency terms
      "power outage", "no electricity", "power failure", "live wire", "exposed wire", "sparking",
      "electricity hazard", "electrical fire", "transformer", "blackout", "power surge",
      "short circuit", "electrical shock", "electric shock", "fire risk", "burning", "smoke",
      
      // Health and safety terms
      "health hazard", "public safety", "sick", "ill", "child", "elderly", "hospital", "school",
      "injured", "injury", "accident", "fallen", "collapse", "trap", "damage", "destroy"
    ];
    
    // Count matched keywords
    let keywordsFound = [];
    for (const keyword of emergencyKeywords) {
      if (textLower.includes(keyword)) {
        keywordsFound.push(keyword);
      }
    }

    if (keywordsFound.length > 0) {
      console.log(`[AI-PRIORITY] Emergency keywords found: ${keywordsFound.join(', ')}`);
      
      // If multiple emergency keywords are found, assign high priority
      if (keywordsFound.length >= 2) {
        console.log("[AI-PRIORITY] Multiple emergency keywords detected, assigning HIGH priority");
        return new Response(
          JSON.stringify({ priority: "high" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    // Enhanced severity scoring for more nuanced assessment
    let severityScore = 0;
    
    // Check general emergency patterns
    if (/urgent|emergency|immediate|asap/i.test(textLower)) severityScore += 2;
    if (/dangerous|hazard|risk|safety/i.test(textLower)) severityScore += 2;
    if (/child(?:ren)?|elderly|hospital|school/i.test(textLower)) severityScore += 1; // Vulnerable populations
    if (/many|multiple|entire|all|everyone|whole/i.test(textLower)) severityScore += 1; // Many affected
    if (/since\s+\d+\s+(?:hour|day|week)/i.test(textLower)) severityScore += 1; // Long duration
    if (/damage(?:d|s)?|destroy(?:ed|s)?/i.test(textLower)) severityScore += 1; // Property damage
    
    // Check for emphasized text (ALL CAPS, multiple exclamation marks)
    const hasEmphasis = /[A-Z]{4,}/.test(complaintText) || /!!+/.test(complaintText);
    if (hasEmphasis) severityScore += 1;
    
    // Check for length of description - longer descriptions often indicate more serious issues
    if (textNormalized.length > 200) severityScore += 1;
    
    // Check if the complaint has a properly constructed sentence structure (often indicates real complaints)
    if (/[A-Z].*\.(\s|$)/.test(textNormalized)) severityScore += 1;

    // Major leak pattern detection
    if (/major\s+(?:leak|pipe|water)/i.test(textLower)) {
      severityScore += 2;
      console.log("Major leak/pipeline mentioned - increasing severity score");
    }

    // Determine priority based on score
    let priority = "medium"; // Default
    if (severityScore >= 3) {
      priority = "high";
    } else if (severityScore <= 0) {
      priority = "low";
    }
    
    console.log(`[AI-PRIORITY] Severity score: ${severityScore}, assigned priority: ${priority}`);

    // Fall back to AI for final decision if not already determined with high confidence
    if (severityScore < 3 && !(textLower === "hello" || textLower === "hi" || textLower === "test")) {
      // Create a detailed prompt for the AI
      const prompt = `
      You are an AI assistant for the PCMC (Pimpri Chinchwad Municipal Corporation) Smart City initiative.
      Your task is to analyze the following ${category} complaint and determine its priority level based on severity, impact, and urgency.
      
      IMPORTANT: I need you to return ONLY "high", "medium", or "low" as your answer, no other text or explanation.
      
      PRIORITY LEVELS EXPLAINED:
      - HIGH: Issues posing immediate risk to public safety, health, or critical infrastructure. Requires immediate attention (0-24 hours).
        Examples: Burst water mains, sewage contamination of drinking water, exposed electrical wires, transformers on fire, complete area outages.
      
      - MEDIUM: Issues causing significant inconvenience but not immediate danger. Should be addressed soon (1-3 days).
        Examples: Low water pressure, intermittent supply/outages, billing errors affecting service, localized issues.
      
      - LOW: Minor issues or general inquiries that can be scheduled for routine handling (3+ days).
        Examples: General inquiries, future billing concerns, information requests, minor cosmetic issues with infrastructure, test messages, greeting messages.

      Comprehensive examples for each priority level:

      HIGH PRIORITY EXAMPLES:
      - "Burst water main on Alandi Road near Shivar Chowk. Water flooding the street causing traffic disruption."
      - "Live wire fallen on road in Akurdi near Dmart. Extremely dangerous situation."
      - "No water supply in entire G Block, Pimpri for 24+ hours. Multiple residents affected including elderly."
      - "Transformer sparking and smoking in Morwadi. Risk of fire to nearby buildings."
      - "Contaminated water with strong smell coming from taps in Sector 25. People falling sick."
      - "Electric pole leaning dangerously after storm, may fall any time."
      - "Power outage affecting hospital area in Chinchwad for over 6 hours."
      - "Sewage mixing with drinking water in our society, children falling ill."
      - "Major pipeline leak near Akurdi railway station causing significant water wastage."
      
      MEDIUM PRIORITY EXAMPLES:
      - "Low water pressure in D Wing for the past 2 days. Only getting water on ground floor."
      - "Intermittent power fluctuations damaging appliances in our building."
      - "Street lights not working on the entire stretch of Aundh Road causing safety concerns."
      - "Water meter showing incorrect readings, bill amount doubled from previous month."
      - "Power outage in specific wing of society while other wings have electricity."
      - "Brown water coming from taps occasionally, not constant or severe."
      - "Water connection was supposed to be installed last week but work not completed."
      
      LOW PRIORITY EXAMPLES:
      - "Need information on water supply schedule during the upcoming festival."
      - "Water bill payment website not working properly. Unable to make online payment."
      - "Request for information about how to apply for new water connection."
      - "Want to understand peak hour electricity rates for small businesses."
      - "Small drip from bathroom tap, not urgent"
      - "One streetlight not working in our lane"
      - "Question about electricity bill calculation methodology."
      - "hello", "hi", "test", "hey" (These are test messages)
      
      COMPLAINT SOURCE: ${source}
      ${attachmentUrl ? `ATTACHMENT INCLUDED: Yes` : ''}
      ${attachmentContent ? `EXTRACTED CONTENT FROM ATTACHMENT: ${attachmentContent}` : ''}
      COMPLAINT CATEGORY: ${category.toUpperCase()}
      COMPLAINT TEXT: ${complaintText}
      
      Consider the following in your analysis:
      1. Is there an immediate health or safety risk?
      2. How many people are affected?
      3. Is essential service completely disrupted or just diminished?
      4. Is there property damage or environmental harm?
      5. Are vulnerable populations (elderly, children, hospitals) affected?
      6. Is the complaint about a complete service outage or partial disruption?
      7. Is the language of the complaint indicating urgency (CAPS, exclamation marks, urgent/emergency terms)?
      
      Answer with ONLY one word: "high", "medium", or "low"
      `;

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
      console.log("Received Gemini API response:", JSON.stringify(data).substring(0, 200) + "...");
      
      try {
        // Extract the priority from the AI response
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const text = data.candidates[0].content.parts[0].text.trim().toLowerCase();
          console.log("Raw AI response:", text);
          
          if (["low", "medium", "high"].includes(text)) {
            priority = text;
            
            // Special override for "hello", "hi", "test" messages to ensure they're always low priority
            if ((textLower === "hello" || textLower === "hi" || textLower === "test" || textLower === "hey") && priority !== "low") {
              console.log("Overriding AI decision for test message to LOW priority");
              priority = "low";
            }
            
            // Special override for burst pipes and major leaks to ensure they're always high priority
            if ((/burst.*pipe|burst.*main|major.*leak/i.test(textLower)) && priority !== "high") {
              console.log("Overriding AI decision for burst pipe/major leak to HIGH priority");
              priority = "high";
            }
          }
        }
      } catch (error) {
        console.error("Error extracting priority from AI response:", error);
        // Keep the priority determined by our severity score
      }
    }

    console.log("[AI-PRIORITY] Final determined priority:", priority);
    return new Response(
      JSON.stringify({ priority }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[AI-PRIORITY] Error in AI priority function:", error);
    return new Response(
      JSON.stringify({ error: error.message, priority: "medium" }), // Return medium as fallback
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 with fallback rather than 500 to avoid blocking complaint submission
      }
    );
  }
});
