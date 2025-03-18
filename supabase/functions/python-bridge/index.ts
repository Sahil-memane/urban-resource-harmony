
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
    // Get the Flask server URL from environment variables
    const FLASK_SERVER_URL = Deno.env.get("FLASK_SERVER_URL") || "http://localhost:5000";
    
    if (!FLASK_SERVER_URL) {
      throw new Error("FLASK_SERVER_URL environment variable is not set");
    }

    console.log("Processing Python bridge request");
    
    // Parse the request body
    const { endpoint, data } = await req.json();
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Missing endpoint" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Forwarding request to Python Flask server at ${FLASK_SERVER_URL}/${endpoint}`);
    
    // Forward the request to the Flask server
    const response = await fetch(`${FLASK_SERVER_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data || {}),
    });
    
    // If the response is not ok, throw an error
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from Flask server: ${response.status} ${errorText}`);
      throw new Error(`Flask server returned ${response.status}: ${errorText}`);
    }
    
    // Parse and return the response
    const responseData = await response.json();
    console.log("Received response from Flask server");
    
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in python-bridge function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
