
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

# Dictionary of measurement explanations for water and energy metrics
MEASUREMENT_EXPLANATIONS = {
    "water": {
        "pH Level": "Measures how acidic or basic water is. The ideal range is 6.5-8.5, with 7 being neutral.",
        "Turbidity (NTU)": "Measures water cloudiness. Lower values indicate clearer water. PCMC standards require <5 NTU.",
        "Total Dissolved Solids (TDS)": "Measures inorganic salts and small organic matter dissolved in water. Ideal range is 300-500 mg/L.",
        "MLD": "Million Liters per Day - Standard unit for measuring water volume in municipal supply systems.",
        "BOD": "Biochemical Oxygen Demand - Amount of dissolved oxygen needed by organisms to break down organic material. Lower is better.",
        "COD": "Chemical Oxygen Demand - Amount of oxygen required for chemical oxidation of contaminants. Lower is better."
    },
    "energy": {
        "MW": "Megawatt - Unit of power equal to one million watts, used to measure electricity generation capacity.",
        "MWh": "Megawatt Hour - Unit of energy equivalent to one megawatt of power sustained for one hour.",
        "kWh": "Kilowatt Hour - Standard unit for measuring electricity consumption in homes.",
        "T&D Losses": "Transmission and Distribution Losses - Percentage of electricity lost during transmission from generation to consumption.",
        "Peak Demand": "Highest amount of electricity drawn from the grid at any given time, measured in MW.",
        "Load Factor": "Ratio of average load to peak load, indicating efficiency of electricity usage. Higher is better."
    }
}

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
        
        # Get the measurement explanations
        water_explanations = MEASUREMENT_EXPLANATIONS["water"]
        energy_explanations = MEASUREMENT_EXPLANATIONS["energy"]
        
        # Process complaints data if available
        complaint_analytics = process_complaints(complaints, user_role) if complaints else {}
        
        # Generate dynamic advisory based on the analytics
        water_advisory = generate_water_advisory(water_analytics, complaints)
        energy_advisory = generate_energy_advisory(energy_analytics, complaints)
        
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
            "waterExplanations": water_explanations,
            "waterAdvisory": water_advisory,
            
            # Add energy-specific analytics
            "energyConsumption": energy_analytics.get('energyConsumption', []),
            "energySources": energy_analytics.get('energySources', []),
            "seasonalEnergyDemand": energy_analytics.get('seasonalDemand', []),
            "energyQuality": energy_analytics.get('energyQuality', []),
            "energyAlerts": energy_analytics.get('citizenAlerts', []),
            "energyProjections": energy_analytics.get('energyProjections', []),
            "energyEfficiency": energy_analytics.get('energyEfficiency', []),
            "energyRisks": energy_analytics.get('energyRisks', []),
            "energyExplanations": energy_explanations,
            "energyAdvisory": energy_advisory
        }
        
        print(f"Generated combined analytics with {len(combined_analytics.keys())} key metrics")
        
        return jsonify(combined_analytics)
    
    except Exception as e:
        print(f"Error in generate_analytics endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

def generate_water_advisory(water_data, complaints):
    """Generate dynamic water advisory based on current data"""
    try:
        # Extract relevant data
        quality_data = water_data.get('waterQuality', [])
        consumption = water_data.get('waterConsumption', [])
        seasonal_demand = water_data.get('seasonalDemand', [])
        
        # Get current month
        current_month = datetime.now().strftime('%B')
        
        # Initialize advisory components
        quality_advice = ""
        conservation_advice = ""
        seasonal_advice = ""
        
        # Quality advice based on latest quality metrics
        if quality_data and len(quality_data) > 0:
            latest_quality = quality_data[-1] if isinstance(quality_data, list) else quality_data
            if latest_quality.get('pH', 7) > 8 or latest_quality.get('pH', 7) < 6.5:
                quality_advice = "Water pH levels are outside ideal range. Consider using water purifiers for drinking water."
            elif latest_quality.get('turbidity', 0) > 4:
                quality_advice = "Water turbidity levels are elevated. Let tap water stand before use to allow particles to settle."
            else:
                quality_advice = "Water quality parameters are within acceptable limits. Regular monitoring continues."
        
        # Conservation advice based on consumption trends
        if consumption and len(consumption) > 1:
            latest_consumption = consumption[-1] if isinstance(consumption, list) else consumption
            previous_consumption = consumption[-2] if isinstance(consumption, list) and len(consumption) > 1 else latest_consumption
            
            if latest_consumption.get('total', 0) > previous_consumption.get('total', 0) * 1.1:
                conservation_advice = "Water consumption is trending upward. Consider installing water-efficient fixtures and checking for leaks."
            else:
                conservation_advice = "Maintain water conservation practices such as reusing greywater for gardens and limiting shower duration."
        
        # Seasonal advice
        for season in seasonal_demand:
            if isinstance(season, dict) and season.get('name', '').lower() == current_month.lower():
                if season.get('demand', 0) > season.get('supply', 0) * 0.8:
                    seasonal_advice = f"During {current_month}, water demand typically increases. Expect potential supply adjustments and store water for essential use."
                else:
                    seasonal_advice = f"{current_month} typically has stable water supply conditions. Report any supply issues promptly."
        
        # Combine advice components
        advisory = {
            "quality": quality_advice or "Regular monitoring of water quality parameters continues.",
            "conservation": conservation_advice or "Practice water conservation by fixing leaks and using water-efficient appliances.",
            "seasonal": seasonal_advice or f"Regular water supply schedules expected for {current_month}. Check PCMC notifications for any changes.",
            "actions": [
                "Report leakages immediately to minimize water loss",
                "Store water adequately during supply hours",
                "Use water efficient fixtures to reduce consumption",
                "Harvest rainwater where possible to supplement supply"
            ]
        }
        
        return advisory
        
    except Exception as e:
        print(f"Error generating water advisory: {e}")
        return {
            "quality": "Monitoring water quality parameters regularly.",
            "conservation": "Practice water conservation measures.",
            "seasonal": "Check PCMC notifications for supply schedules.",
            "actions": ["Report leakages", "Store water adequately", "Use water efficiently"]
        }

def generate_energy_advisory(energy_data, complaints):
    """Generate dynamic energy advisory based on current data"""
    try:
        # Extract relevant data
        consumption = energy_data.get('energyConsumption', [])
        efficiency = energy_data.get('energyEfficiency', [])
        seasonal_demand = energy_data.get('seasonalDemand', [])
        
        # Get current month and season
        current_month = datetime.now().strftime('%B')
        current_season = get_current_season()
        
        # Initialize advisory components
        consumption_advice = ""
        efficiency_advice = ""
        seasonal_advice = ""
        
        # Consumption advice based on recent trends
        if consumption and len(consumption) > 1:
            latest_consumption = consumption[-1] if isinstance(consumption, list) else consumption
            previous_consumption = consumption[-2] if isinstance(consumption, list) and len(consumption) > 1 else latest_consumption
            
            if latest_consumption.get('total', 0) > previous_consumption.get('total', 0) * 1.05:
                consumption_advice = "Energy consumption is trending upward. Consider energy audits and using energy-efficient appliances."
            else:
                consumption_advice = "Maintain energy conservation practices such as turning off unused lights and appliances."
        
        # Efficiency advice
        if efficiency and len(efficiency) > 0:
            latest_efficiency = efficiency[-1] if isinstance(efficiency, list) else efficiency
            
            if latest_efficiency.get('losses', 0) > 15:
                efficiency_advice = "Energy distribution losses are higher than optimal. Report any localized voltage issues to improve grid efficiency."
            else:
                efficiency_advice = "Grid efficiency is within normal parameters. Continue using energy during non-peak hours when possible."
        
        # Seasonal advice
        for season in seasonal_demand:
            if isinstance(season, dict) and (season.get('name', '').lower() == current_season.lower() or season.get('name', '').lower() == current_month.lower()):
                if season.get('demand', 0) > season.get('capacity', 0) * 0.9:
                    seasonal_advice = f"During {current_season}, energy demand typically peaks. Avoid using heavy appliances between 6-10 PM to prevent potential outages."
                else:
                    seasonal_advice = f"{current_season} typically has stable energy supply conditions. Report any outages promptly."
        
        # Combine advice components
        advisory = {
            "consumption": consumption_advice or "Monitor your energy consumption by checking your meter regularly.",
            "efficiency": efficiency_advice or "Use energy-efficient appliances and LED lighting to reduce consumption.",
            "seasonal": seasonal_advice or f"Regular energy supply expected for {current_season}. Check MSEDCL notifications for any maintenance schedules.",
            "actions": [
                "Avoid using heavy appliances during peak hours (6-10 PM)",
                "Use natural light during daytime where possible",
                "Maintain appliances regularly for optimal efficiency",
                "Consider solar solutions for supplementary power"
            ]
        }
        
        return advisory
        
    except Exception as e:
        print(f"Error generating energy advisory: {e}")
        return {
            "consumption": "Monitor your energy consumption regularly.",
            "efficiency": "Use energy-efficient appliances and lighting.",
            "seasonal": "Check MSEDCL notifications for maintenance schedules.",
            "actions": ["Avoid peak hour usage", "Use natural light", "Maintain appliances", "Consider renewable options"]
        }

def get_current_season():
    """Determine current season based on month"""
    month = datetime.now().month
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    else:
        return "Autumn"

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
            result['explanations'] = MEASUREMENT_EXPLANATIONS['water']
        elif resource_type == 'energy':
            result = data_fetcher.get_energy_analytics()
            result['explanations'] = MEASUREMENT_EXPLANATIONS['energy']
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
                # Calculate resolution time in hours for more granular analysis
                df['resolution_hours'] = (df['resolved_date'] - df['date']).dt.total_seconds() / 3600
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
        
        # Enhanced response rate analytics with more granular time categories
        if 'resolution_hours' in df.columns:
            # Define more detailed time categories
            time_categories = ["< 6 hours", "< 12 hours", "12-24 hours", "24-48 hours", "> 48 hours"]
            
            df['response_category'] = pd.cut(
                df['resolution_hours'],
                bins=[0, 6, 12, 24, 48, float('inf')],
                labels=time_categories,
                right=False
            )
            
            response_counts = df['response_category'].value_counts().reset_index()
            response_counts.columns = ['name', 'value']
            total = response_counts['value'].sum()
            
            if total > 0:
                response_counts['value'] = (response_counts['value'] / total * 100).round(1)
            
            # Sort by time category for consistent display
            category_order = {cat: i for i, cat in enumerate(time_categories)}
            response_counts['order'] = response_counts['name'].map(category_order)
            response_counts = response_counts.sort_values('order').drop('order', axis=1)
            
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
