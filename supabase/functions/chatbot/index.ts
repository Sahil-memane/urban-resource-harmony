
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

    const { message, chatHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Missing message" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Processing chatbot message:", message);

    // Prepare system prompt
    const systemPrompt = `
    You are a helpful assistant for a citizen services portal focusing on water and energy services.
    Your name is CityAssist and you help users navigate the portal and submit complaints.
    
    You can help users with:
    - Understanding how to submit complaints about water or energy services
    - Explaining the complaint tracking system
    - Navigating to different parts of the portal
    - Explaining priority levels for complaints
    
    Be concise, friendly, and helpful. If you don't know something, say so.
    
    Always respond in a helpful and informative way, never respond with "I'm sorry, I couldn't generate a response at the moment."
    `;

    // Prepare messages including history
    const messages = [
      {
        role: "system",
        parts: [{ text: systemPrompt }]
      }
    ];

    // Add chat history if available
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const entry of chatHistory) {
        if (entry.role && entry.content) {
          messages.push({
            role: entry.role === "user" ? "user" : "model",
            parts: [{ text: entry.content }]
          });
        }
      }
    }

    // Add current user message
    messages.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Log the entire conversation for debugging
    console.log("Full conversation context:", JSON.stringify(messages, null, 2));

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data, null, 2));
    
    let botResponse = "I'm here to help with water and energy services. Could you please try asking your question again?";
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      botResponse = data.candidates[0].content.parts[0].text;
    }

    console.log("Bot response generated:", botResponse);
    return new Response(
      JSON.stringify({ response: botResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in chatbot function:", error);
    return new Response(
      JSON.stringify({ error: error.message, response: "I'm having trouble connecting right now. Please try again later." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
