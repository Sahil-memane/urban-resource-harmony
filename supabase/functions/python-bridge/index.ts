
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
    const FLASK_SERVER_URL = Deno.env.get("FLASK_SERVER_URL") || "http://localhost:5000";
    const { endpoint, data } = await req.json();

    if (!endpoint) {
      throw new Error("Missing endpoint parameter");
    }

    console.log(`Forwarding request to Flask server: ${endpoint}`, data);

    // Forward the request to the Flask server
    const response = await fetch(`${FLASK_SERVER_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Flask server error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    console.log(`Response from Flask server:`, result);

    return new Response(
      JSON.stringify(result),
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
