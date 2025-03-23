
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

    const { fileUrl, fileType } = await req.json();
    
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    console.log(`Extracting content from ${fileType} file: ${fileUrl.substring(0, 50)}...`);

    // Create a specialized prompt based on file type
    let prompt = "";
    
    if (fileType === "image") {
      prompt = `
      Look at this image carefully. This is an image of a complaint related to urban infrastructure 
      (likely water or electricity services). 
      
      Describe the content of this image in detail, focusing on:
      1. Any text visible in the image
      2. What problem is being shown (e.g., water leakage, electrical issues, broken infrastructure)
      3. How severe the issue appears to be
      4. Any emergency indicators visible
      
      Provide a thorough but concise description that captures all the relevant information about the issue shown.
      `;
    } 
    else if (fileType === "pdf" || fileType === "document") {
      prompt = `
      Examine this document carefully. This is a complaint document related to urban infrastructure 
      (likely water or electricity services).
      
      Extract and summarize the key information, focusing on:
      1. The main complaint or issue being reported
      2. Any details about location, timing, or extent of the problem
      3. Any emergency indicators or urgent language
      4. Severity of the described issue
      
      Provide a thorough but concise summary that captures all the relevant information about the reported issue.
      `;
    }
    else if (fileType === "audio") {
      prompt = `
      Listen to this audio carefully. This is a voice recording of a complaint related to urban infrastructure 
      (likely water or electricity services).
      
      Transcribe and summarize the key information, focusing on:
      1. The main complaint or issue being reported verbally
      2. Any details about location, timing, or extent of the problem
      3. Any emergency indicators or urgent language used
      4. The tone of voice and perceived severity/urgency
      
      Provide a thorough but concise transcription and summary that captures all the relevant information about the reported issue.
      `;
    }

    // Call Gemini for content understanding
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: fileType === "audio" ? "audio/wav" : fileType === "pdf" ? "application/pdf" : "image/jpeg",
                  data: fileUrl.startsWith("data:") ? fileUrl.split(",")[1] : fileUrl
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800
        }
      })
    });

    const data = await response.json();
    
    if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Failed to extract content from file");
    }
    
    const extractedText = data.candidates[0].content.parts[0].text;
    console.log("Successfully extracted content:", extractedText.substring(0, 100) + "...");

    return new Response(
      JSON.stringify({ 
        extracted: extractedText,
        fileType
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in extract-content function:", error);
    return new Response(
      JSON.stringify({ error: error.message, extracted: null }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 with error rather than 500 to avoid blocking complaint submission
      }
    );
  }
});
