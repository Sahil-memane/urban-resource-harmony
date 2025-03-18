
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get the API key from the environment variables
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Define CORS headers for cross-origin requests
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
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Parse the request body
    const { message, chatHistory } = await req.json();
    console.log('Received message:', message);
    console.log('Chat history:', chatHistory);

    if (!message) {
      throw new Error('No message provided');
    }

    // Prepare the conversation history for Gemini
    const formattedHistory = chatHistory.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add the new user message to the history
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Create the system instruction for Gemini
    const systemInstruction = {
      role: 'system',
      parts: [{ 
        text: `You are CityAssist, a helpful assistant for a city utility company that handles water and energy services. 
        Your goal is to assist citizens with their questions about water supply, energy services, billing, and complaint procedures.
        Provide concise, friendly, and informative responses. If you don't know the answer to a specific question, acknowledge that 
        and suggest the user submit a formal complaint through the app or contact customer service.`
      }]
    };

    // Check if system instruction is already in the history
    const conversationHistory = formattedHistory.length > 0 && 
      formattedHistory[0].role === 'system' ? 
      formattedHistory : 
      [systemInstruction, ...formattedHistory];

    console.log('Sending to Gemini API with conversation:', conversationHistory);

    // Make request to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);

    // Extract text response from Gemini
    let assistantResponse = '';
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      assistantResponse = data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response format:', data);
      throw new Error('Failed to get a proper response from Gemini');
    }

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in chatbot function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
