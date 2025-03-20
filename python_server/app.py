
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
import json
from datetime import datetime
import pandas as pd
from data_fetcher import PCMCDataFetcher

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini API with key from environment
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("WARNING: GEMINI_API_KEY not set in environment variables")

# Initialize the data fetcher
data_fetcher = PCMCDataFetcher()

@app.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        message = data.get('message', '')
        chat_history = data.get('chatHistory', [])
        
        # Check if API key is available
        if not api_key:
            return jsonify({"error": "GEMINI_API_KEY not set"}), 500
        
        # Create a prompt with context about the city services
        system_prompt = """
        You are CityAssist, a helpful assistant for a citizen services portal focusing on water and energy services in the Pimpri Chinchwad area.
        You help users navigate the portal and submit complaints about water and energy services.
        
        Some facts about the system:
        - Users can submit complaints through text, voice recording, or image upload
        - Complaints can be categorized as water or energy related
        - Complaints are assigned a priority (low, medium, high)
        - Users can track the status of their complaints
        
        Important facts about Pimpri Chinchwad water and electricity:
        - The city faces seasonal water shortages, especially during summer months
        - Water is supplied from Pavana dam and is treated at Nigdi water treatment plant
        - Electricity is distributed by MSEDCL (Maharashtra State Electricity Distribution Company Limited)
        - Power demand peaks during summer months due to air conditioning use
        - Many areas are experiencing infrastructure upgrades to support growing population
        
        Be concise, friendly, and helpful. If you don't know something, say so.
        """
        
        # Format the chat history for Gemini
        messages = [{"role": "system", "parts": [system_prompt]}]
        
        for msg in chat_history:
            role = "user" if msg.get("role") == "user" else "model"
            messages.append({"role": role, "parts": [msg.get("content", "")]})
        
        # Add the current message
        messages.append({"role": "user", "parts": [message]})
        
        # Generate a response using Gemini
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(messages)
        
        return jsonify({"response": response.text})
    
    except Exception as e:
        print(f"Error in chatbot endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_analytics', methods=['POST'])
def generate_analytics():
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        complaints = data.get('complaints', [])
        user_role = data.get('userRole', 'citizen')
        view_type = data.get('viewType', 'overview')
        
        # Fetch real-time analytics data based on role
        water_analytics = data_fetcher.get_water_analytics()
        energy_analytics = data_fetcher.get_energy_analytics()
        
        # Process complaints data if available
        complaint_analytics = process_complaints(complaints, user_role) if complaints else {}
        
        # Combine all analytics data
        combined_analytics = {
            # Include general analytics first
            **complaint_analytics,
            
            # Add water-specific analytics
            "waterConsumption": water_analytics.get('waterConsumption', []),
            "waterSources": water_analytics.get('waterSources', []),
            "seasonalWaterDemand": water_analytics.get('seasonalDemand', []),
            "waterQuality": water_analytics.get('waterQuality', []),
            "waterAlerts": water_analytics.get('citizenAlerts', []),
            "waterProjections": water_analytics.get('waterProjections', []),
            "waterEfficiency": water_analytics.get('waterEfficiency', []),
            "waterRisks": water_analytics.get('waterRisks', []),
            
            # Add energy-specific analytics
            "energyConsumption": energy_analytics.get('energyConsumption', []),
            "energySources": energy_analytics.get('energySources', []),
            "seasonalEnergyDemand": energy_analytics.get('seasonalDemand', []),
            "energyQuality": energy_analytics.get('energyQuality', []),
            "energyAlerts": energy_analytics.get('citizenAlerts', []),
            "energyProjections": energy_analytics.get('energyProjections', []),
            "energyEfficiency": energy_analytics.get('energyEfficiency', []),
            "energyRisks": energy_analytics.get('energyRisks', [])
        }
        
        print(f"Generated combined analytics with {len(combined_analytics.keys())} key metrics")
        
        return jsonify(combined_analytics)
    
    except Exception as e:
        print(f"Error in generate_analytics endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_charts', methods=['POST'])
def generate_charts():
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        chart_type = data.get('chartType', 'bar')
        data_source = data.get('dataSource', [])
        params = data.get('params', {})
        
        if not data_source or not params:
            return jsonify({"error": "Missing data source or parameters"}), 400
        
        # Generate the chart
        chart_result = data_fetcher.generate_analytics_chart(chart_type, data_source, params)
        
        return jsonify(chart_result)
    
    except Exception as e:
        print(f"Error in generate_charts endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/fetch_resource_data', methods=['POST'])
def fetch_resource_data():
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        resource_type = data.get('resourceType', '')
        force_refresh = data.get('forceRefresh', False)
        
        if not resource_type:
            return jsonify({"error": "Missing resource type"}), 400
        
        # Fetch data based on resource type
        if resource_type == 'water':
            result = data_fetcher.get_water_analytics()
        elif resource_type == 'energy':
            result = data_fetcher.get_energy_analytics()
        else:
            return jsonify({"error": f"Unknown resource type: {resource_type}"}), 400
        
        return jsonify({
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in fetch_resource_data endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

def process_complaints(complaints, user_role):
    """Process complaints data to generate analytics"""
    try:
        # Create a pandas DataFrame for more advanced analysis
        df = pd.DataFrame(complaints)
        
        # Convert date strings to datetime objects
        try:
            df['date'] = pd.to_datetime(df['date'])
            if 'resolved_date' in df.columns:
                df['resolved_date'] = pd.to_datetime(df['resolved_date'])
                # Calculate resolution time in days
                df['resolution_days'] = (df['resolved_date'] - df['date']).dt.total_seconds() / (24 * 3600)
        except Exception as e:
            print(f"Error processing dates: {e}")
        
        # Filter by role if needed
        if user_role == 'water-admin':
            df = df[df['category'] == 'water']
        elif user_role == 'energy-admin':
            df = df[df['category'] == 'energy']
        
        # Generate basic analytics
        result = {}
        
        # Category distribution
        if 'category' in df.columns:
            category_counts = df['category'].value_counts().reset_index()
            category_counts.columns = ['name', 'value']
            result['categoryData'] = category_counts.to_dict('records')
        
        # Priority distribution
        if 'priority' in df.columns:
            priority_counts = df['priority'].value_counts().reset_index()
            priority_counts.columns = ['name', 'value']
            result['priorityData'] = priority_counts.to_dict('records')
        
        # Monthly trends
        if 'date' in df.columns and 'category' in df.columns:
            df['month_year'] = df['date'].dt.strftime('%Y-%m')
            monthly_counts = df.groupby(['month_year', 'category']).size().unstack(fill_value=0).reset_index()
            
            if 'water' not in monthly_counts.columns:
                monthly_counts['water'] = 0
            if 'energy' not in monthly_counts.columns:
                monthly_counts['energy'] = 0
            
            monthly_counts['total'] = monthly_counts['water'] + monthly_counts['energy']
            
            result['trendsData'] = monthly_counts.rename(columns={'month_year': 'date'}).to_dict('records')
        
        # Resolution time
        if 'resolution_days' in df.columns and 'category' in df.columns:
            resolution_time = df.groupby('category')['resolution_days'].mean().reset_index()
            resolution_time.columns = ['name', 'value']
            result['resolutionData'] = resolution_time.to_dict('records')
        
        # Response rate analytics
        if 'resolution_days' in df.columns:
            # Calculate % of complaints responded within different time frames
            time_categories = ["< 24 hours", "24-48 hours", "> 48 hours"]
            df['response_category'] = pd.cut(
                df['resolution_days'] * 24,  # Convert to hours
                bins=[0, 24, 48, float('inf')],
                labels=time_categories
            )
            
            response_counts = df['response_category'].value_counts().reset_index()
            response_counts.columns = ['name', 'value']
            total = response_counts['value'].sum()
            
            response_counts['value'] = (response_counts['value'] / total * 100).round()
            result['responseRateData'] = response_counts.to_dict('records')
        
        # Time of day analysis
        if 'date' in df.columns:
            df['hour'] = df['date'].dt.hour
            df['time_of_day'] = pd.cut(
                df['hour'],
                bins=[0, 6, 12, 18, 24],
                labels=["Night (0-6)", "Morning (6-12)", "Afternoon (12-18)", "Evening (18-24)"]
            )
            
            time_counts = df['time_of_day'].value_counts().reset_index()
            time_counts.columns = ['name', 'value']
            result['timeOfDayData'] = time_counts.to_dict('records')
        
        return result
    
    except Exception as e:
        print(f"Error processing complaints data: {e}")
        return {}

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
