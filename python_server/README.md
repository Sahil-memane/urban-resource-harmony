
# Python Backend Server for Complaints App

This is a Flask-based Python backend server that provides APIs for the Complaints application, including:

- Chatbot functionality using Google's Gemini API
- Analytics generation with matplotlib and numpy
- Data visualization and processing

## Setup Instructions

1. Install Python 3.9+ if you don't have it already

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set the GEMINI_API_KEY environment variable:
   - Windows: `set GEMINI_API_KEY=your_api_key_here`
   - macOS/Linux: `export GEMINI_API_KEY=your_api_key_here`

6. Run the Flask server:
   ```bash
   python app.py
   ```

The server will start on http://localhost:5000 by default.

## Available Endpoints

- `/chatbot` - POST request for chatbot functionality
- `/generate_analytics` - POST request to generate analytics charts

## Connecting to Supabase Edge Functions

To connect the Python backend to the Supabase Edge Functions, configure the FLASK_SERVER_URL secret in your Supabase project to point to where this server is hosted.

For local development, use:
- http://localhost:5000 (if running the Flask server locally)
- or a public URL if you're using a tool like ngrok to expose your local server
