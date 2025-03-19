
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PYTHON_SERVER_URL = "http://localhost:5000";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, data } = await req.json();
    console.log(`Python bridge request: ${endpoint}`, data);

    // Call the appropriate Python server endpoint
    const response = await fetch(`${PYTHON_SERVER_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Python server responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`Python bridge response from ${endpoint}:`, result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Python bridge error:', error);
    
    // More robust error handling with fallback
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error connecting to Python server',
        fallback: true, // Indicate this is a fallback response
        status: "error"
      }),
      { 
        status: 200, // Return 200 to allow client fallback
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
