
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
import matplotlib.pyplot as plt
import matplotlib
import numpy as np
import base64
from io import BytesIO
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import json
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import seaborn as sns

# Configure matplotlib to use Agg backend (non-interactive, good for web servers)
matplotlib.use('Agg')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini API with key from environment
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("WARNING: GEMINI_API_KEY not set in environment variables")

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
        You are CityAssist, a helpful assistant for a citizen services portal focusing on water and energy services.
        You help users navigate the portal and submit complaints about water and energy services.
        
        Some facts about the system:
        - Users can submit complaints through text, voice recording, or image upload
        - Complaints can be categorized as water or energy related
        - Complaints are assigned a priority (low, medium, high)
        - Users can track the status of their complaints
        
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
        
        if not complaints:
            return jsonify({"error": "No complaints data provided"}), 400
        
        print(f"Generating {view_type} analytics for {len(complaints)} complaints as {user_role}")
        
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
        
        # Generate analytics based on view type
        if view_type == 'overview':
            result = generate_overview_analytics(df, user_role)
        elif view_type == 'trends':
            result = generate_trends_analytics(df, user_role)
        elif view_type == 'predictions':
            result = generate_predictions_analytics(df, user_role)
        else:
            result = generate_overview_analytics(df, user_role)
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error in generate_analytics endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

def generate_overview_analytics(df, user_role):
    """Generate overview analytics"""
    try:
        # Category distribution
        category_data = generate_category_chart(df)
        
        # Priority distribution
        priority_data = generate_priority_chart(df)
        
        # Monthly trends
        trends_data = generate_trends_chart(df)
        
        # Resolution time
        resolution_data = generate_resolution_chart(df)
        
        # Response rate analytics
        response_rate_data = generate_response_rate_chart(df)
        
        # Time of day analysis
        time_of_day_data = generate_time_of_day_chart(df)
        
        # User satisfaction (mock data)
        satisfaction_scores = generate_satisfaction_chart(df, user_role)
        
        return {
            "categoryData": category_data,
            "priorityData": priority_data,
            "trendsData": trends_data,
            "resolutionData": resolution_data,
            "responseRateData": response_rate_data,
            "timeOfDayData": time_of_day_data,
            "satisfactionScores": satisfaction_scores
        }
    except Exception as e:
        print(f"Error generating overview analytics: {e}")
        return {}

def generate_trends_analytics(df, user_role):
    """Generate trends analytics"""
    try:
        # Monthly trends (reused from overview)
        monthly_trends = generate_trends_chart(df)
        
        # Area comparison (simulated)
        area_comparison = generate_area_comparison_chart(df, user_role)
        
        # Seasonal trends (simulated)
        seasonal_trends = generate_seasonal_trends_chart(df, user_role)
        
        # Recurring issues analysis (simulated)
        recurring_issues = generate_recurring_issues_chart(df, user_role)
        
        return {
            "monthlyTrends": monthly_trends,
            "areaComparison": area_comparison,
            "seasonalTrends": seasonal_trends,
            "recurringIssues": recurring_issues
        }
    except Exception as e:
        print(f"Error generating trends analytics: {e}")
        return {}

def generate_predictions_analytics(df, user_role):
    """Generate predictions analytics"""
    try:
        # Expected volume prediction
        expected_volume = generate_expected_volume_chart(df)
        
        # Resolution time predictions
        resolution_predictions = generate_resolution_predictions_chart(df, user_role)
        
        # Resource allocation recommendations
        resource_allocation = generate_resource_allocation_chart(df, user_role)
        
        return {
            "expectedVolume": expected_volume,
            "resolutionPredictions": resolution_predictions,
            "resourceAllocation": resource_allocation
        }
    except Exception as e:
        print(f"Error generating predictions analytics: {e}")
        return {}

def generate_category_chart(df):
    """Generate category distribution data"""
    try:
        # Get category counts
        category_counts = df['category'].value_counts().to_dict()
        
        # Format for frontend
        result = [{"name": k, "value": v} for k, v in category_counts.items()]
        
        return result
    except Exception as e:
        print(f"Error generating category chart: {e}")
        return []

def generate_priority_chart(df):
    """Generate priority distribution data"""
    try:
        # Get priority counts
        priority_counts = df['priority'].value_counts().to_dict()
        
        # Ensure all priority levels are included
        for priority in ['high', 'medium', 'low']:
            if priority not in priority_counts:
                priority_counts[priority] = 0
        
        # Format for frontend
        result = [{"name": k, "value": v} for k, v in priority_counts.items()]
        
        return result
    except Exception as e:
        print(f"Error generating priority chart: {e}")
        return []

def generate_trends_chart(df):
    """Generate monthly trends data"""
    try:
        # Ensure we have a date column
        if 'date' not in df.columns:
            return []
        
        # Group by month and category
        df['month'] = df['date'].dt.strftime('%Y-%m')
        monthly_data = df.groupby(['month', 'category']).size().unstack(fill_value=0).reset_index()
        
        # Ensure all categories are included
        if 'water' not in monthly_data.columns:
            monthly_data['water'] = 0
        if 'energy' not in monthly_data.columns:
            monthly_data['energy'] = 0
        
        # Add total column
        monthly_data['total'] = monthly_data['water'] + monthly_data['energy']
        
        # Format for frontend
        result = []
        for _, row in monthly_data.iterrows():
            result.append({
                "date": row['month'],
                "water": int(row['water']),
                "energy": int(row['energy']),
                "total": int(row['total'])
            })
        
        return result
    except Exception as e:
        print(f"Error generating trends chart: {e}")
        return []

def generate_resolution_chart(df):
    """Generate resolution time data"""
    try:
        # Filter to resolved complaints with valid resolution_days
        if 'resolution_days' not in df.columns or df.empty:
            # Return mock data if no real data available
            return [
                {"name": "water", "value": 3.5},
                {"name": "energy", "value": 4.2}
            ]
        
        resolved_df = df[df['resolution_days'].notna()]
        
        if resolved_df.empty:
            # Return mock data if no resolved complaints
            return [
                {"name": "water", "value": 3.5},
                {"name": "energy", "value": 4.2}
            ]
        
        # Calculate average resolution time by category
        avg_resolution = resolved_df.groupby('category')['resolution_days'].mean().to_dict()
        
        # Format for frontend
        result = [{"name": k, "value": round(v, 1)} for k, v in avg_resolution.items()]
        
        return result
    except Exception as e:
        print(f"Error generating resolution chart: {e}")
        return []

def generate_response_rate_chart(df):
    """Generate response rate data (% resolved within timeframes)"""
    try:
        # Return mock data if we don't have the necessary columns
        if 'resolution_days' not in df.columns or df.empty:
            return [
                {"name": "< 24 hours", "value": 35},
                {"name": "24-48 hours", "value": 45},
                {"name": "> 48 hours", "value": 20}
            ]
        
        resolved_df = df[df['resolution_days'].notna()]
        
        if resolved_df.empty:
            return [
                {"name": "< 24 hours", "value": 35},
                {"name": "24-48 hours", "value": 45},
                {"name": "> 48 hours", "value": 20}
            ]
        
        # Calculate hours to resolve
        hours_to_resolve = resolved_df['resolution_days'] * 24
        
        # Count complaints in each timeframe
        within_24h = sum(hours_to_resolve <= 24)
        within_48h = sum((hours_to_resolve > 24) & (hours_to_resolve <= 48))
        over_48h = sum(hours_to_resolve > 48)
        
        total = within_24h + within_48h + over_48h
        
        # Calculate percentages
        if total > 0:
            within_24h_pct = round((within_24h / total) * 100)
            within_48h_pct = round((within_48h / total) * 100)
            over_48h_pct = round((over_48h / total) * 100)
        else:
            within_24h_pct = 0
            within_48h_pct = 0
            over_48h_pct = 0
        
        return [
            {"name": "< 24 hours", "value": within_24h_pct},
            {"name": "24-48 hours", "value": within_48h_pct},
            {"name": "> 48 hours", "value": over_48h_pct}
        ]
    except Exception as e:
        print(f"Error generating response rate chart: {e}")
        return []

def generate_time_of_day_chart(df):
    """Generate time of day distribution data"""
    try:
        # Return mock data if we don't have date info
        if 'date' not in df.columns or df.empty:
            return [
                {"name": "Morning (6-12)", "value": 35},
                {"name": "Afternoon (12-18)", "value": 45},
                {"name": "Evening (18-24)", "value": 30},
                {"name": "Night (0-6)", "value": 10}
            ]
        
        # Extract hour from date
        df['hour'] = df['date'].dt.hour
        
        # Define time slots
        time_slots = {
            "Morning (6-12)": (6, 12),
            "Afternoon (12-18)": (12, 18),
            "Evening (18-24)": (18, 24),
            "Night (0-6)": (0, 6)
        }
        
        # Count complaints in each time slot
        counts = {}
        for slot_name, (start, end) in time_slots.items():
            if start < end:
                counts[slot_name] = sum((df['hour'] >= start) & (df['hour'] < end))
            else:  # Handle night crossing midnight
                counts[slot_name] = sum((df['hour'] >= start) | (df['hour'] < end))
        
        # Format for frontend
        result = [{"name": k, "value": v} for k, v in counts.items()]
        
        return result
    except Exception as e:
        print(f"Error generating time of day chart: {e}")
        return []

def generate_satisfaction_chart(df, user_role):
    """Generate user satisfaction data (simulated)"""
    try:
        # For now, this is simulated data
        # In a real application, you would use actual feedback data
        
        # Adjust the distribution based on user role for more realistic simulation
        if user_role == 'water-admin':
            distribution = [25, 30, 15, 20, 10]  # More mixed satisfaction
        elif user_role == 'energy-admin':
            distribution = [20, 35, 20, 15, 10]  # Slightly better than water
        else:  # super-admin or citizen
            distribution = [22, 33, 18, 17, 10]  # Average of the two
        
        # Randomize a bit while keeping the general distribution
        import random
        distribution = [max(1, round(d + random.uniform(-5, 5))) for d in distribution]
        
        # Normalize to approximately 100 total
        total = sum(distribution)
        if total != 0:
            distribution = [round(d * 100 / total) for d in distribution]
            
            # Ensure we add up to 100%
            diff = 100 - sum(distribution)
            distribution[0] += diff
        
        return [
            {"name": "Very satisfied", "value": distribution[0]},
            {"name": "Satisfied", "value": distribution[1]},
            {"name": "Neutral", "value": distribution[2]},
            {"name": "Unsatisfied", "value": distribution[3]},
            {"name": "Very unsatisfied", "value": distribution[4]}
        ]
    except Exception as e:
        print(f"Error generating satisfaction chart: {e}")
        return []

def generate_area_comparison_chart(df, user_role):
    """Generate area comparison data (simulated)"""
    try:
        # This is simulated data - in a real app, you'd have location data
        areas = ["North Zone", "South Zone", "East Zone", "West Zone", "Central"]
        
        # Create different metrics based on user role
        if user_role == 'water-admin':
            import random
            return [
                {
                    "name": area,
                    "leakage": random.randint(5, 35),
                    "shortage": random.randint(3, 23),
                    "quality": random.randint(2, 17)
                }
                for area in areas
            ]
        elif user_role == 'energy-admin':
            import random
            return [
                {
                    "name": area,
                    "outages": random.randint(5, 30),
                    "voltage": random.randint(3, 21),
                    "billing": random.randint(2, 14)
                }
                for area in areas
            ]
        else:
            # Super admin
            import random
            return [
                {
                    "name": area,
                    "water": random.randint(10, 50),
                    "energy": random.randint(10, 45)
                }
                for area in areas
            ]
    except Exception as e:
        print(f"Error generating area comparison chart: {e}")
        return []

def generate_seasonal_trends_chart(df, user_role):
    """Generate seasonal trends data (simulated with some real data if available)"""
    try:
        seasons = ["Winter", "Spring", "Summer", "Fall"]
        
        # Try to extract some real seasonal data if available
        real_seasonal_data = {}
        if 'date' in df.columns and not df.empty:
            df['season'] = df['date'].dt.month.apply(lambda m: 
                              "Winter" if m in [12, 1, 2] else
                              "Spring" if m in [3, 4, 5] else
                              "Summer" if m in [6, 7, 8] else
                              "Fall")
            
            if 'category' in df.columns:
                seasonal_counts = df.groupby(['season', 'category']).size().unstack(fill_value=0)
                for season in seasons:
                    if season in seasonal_counts.index:
                        real_seasonal_data[season] = seasonal_counts.loc[season].to_dict()
        
        # Create data with some real influence if available
        import random
        
        if user_role == 'water-admin':
            result = []
            for season in seasons:
                base_leakage = random.randint(10, 30)
                base_flooding = random.randint(5, 20)
                base_quality = random.randint(5, 15)
                
                # Apply seasonal effects
                if season == "Summer":
                    base_flooding += random.randint(20, 30)  # More flooding in summer due to rains
                elif season == "Winter":
                    base_leakage += random.randint(5, 15)  # More leakages in winter due to frozen pipes
                
                # Incorporate real data if available
                if season in real_seasonal_data and 'water' in real_seasonal_data[season]:
                    real_factor = max(1, real_seasonal_data[season]['water'] / 5)  # Scale factor based on real data
                    base_leakage = int(base_leakage * real_factor)
                    base_flooding = int(base_flooding * real_factor)
                    base_quality = int(base_quality * real_factor)
                
                result.append({
                    "name": season,
                    "leakage": base_leakage,
                    "flooding": base_flooding,
                    "quality": base_quality
                })
            return result
            
        elif user_role == 'energy-admin':
            result = []
            for season in seasons:
                base_outages = random.randint(5, 25)
                base_demand = random.randint(15, 40)
                base_efficiency = random.randint(85, 95)
                
                # Apply seasonal effects
                if season == "Summer":
                    base_outages += random.randint(10, 20)  # More outages in summer due to AC load
                    base_demand += random.randint(20, 40)  # More demand in summer due to AC
                elif season == "Winter":
                    base_outages += random.randint(5, 15)  # More outages in winter due to heating
                    base_demand += random.randint(15, 35)  # More demand in winter due to heating
                
                # Incorporate real data if available
                if season in real_seasonal_data and 'energy' in real_seasonal_data[season]:
                    real_factor = max(1, real_seasonal_data[season]['energy'] / 5)  # Scale factor based on real data
                    base_outages = int(base_outages * real_factor)
                    base_demand = int(base_demand * real_factor)
                
                result.append({
                    "name": season,
                    "outages": base_outages,
                    "demand": base_demand,
                    "efficiency": base_efficiency
                })
            return result
            
        else:
            # Super admin
            result = []
            for season in seasons:
                base_water = random.randint(20, 50)
                base_energy = random.randint(30, 60)
                base_resolved = random.randint(60, 90)
                
                # Apply seasonal effects
                if season == "Summer":
                    base_water += random.randint(10, 20)
                    base_energy += random.randint(15, 25)
                elif season == "Winter":
                    base_water += random.randint(5, 15)
                    base_energy += random.randint(10, 20)
                
                # Incorporate real data if available
                if season in real_seasonal_data:
                    if 'water' in real_seasonal_data[season]:
                        real_water_factor = max(1, real_seasonal_data[season]['water'] / 5)
                        base_water = int(base_water * real_water_factor)
                    if 'energy' in real_seasonal_data[season]:
                        real_energy_factor = max(1, real_seasonal_data[season]['energy'] / 5)
                        base_energy = int(base_energy * real_energy_factor)
                
                result.append({
                    "name": season,
                    "water": base_water,
                    "energy": base_energy,
                    "resolved": base_resolved
                })
            return result
    except Exception as e:
        print(f"Error generating seasonal trends chart: {e}")
        return []

def generate_recurring_issues_chart(df, user_role):
    """Generate recurring issues data (simulated)"""
    try:
        # Define issues based on user role
        if user_role == 'water-admin':
            issues = ["Pipe leakage", "Low pressure", "Water quality", "Meter issues", "Water shortage"]
        elif user_role == 'energy-admin':
            issues = ["Power outage", "Voltage fluctuation", "Billing errors", "Street lights", "Transformer issues"]
        else:
            issues = ["Water issues", "Energy issues", "Infrastructure", "Billing", "Other"]
        
        # Generate simulated data
        import random
        return [
            {
                "name": issue,
                "count": random.randint(10, 60),
                "recurringRate": random.randint(10, 60)
            }
            for issue in issues
        ]
    except Exception as e:
        print(f"Error generating recurring issues chart: {e}")
        return []

def generate_expected_volume_chart(df):
    """Generate expected complaint volume predictions"""
    try:
        # Real data for model training if available
        has_real_data = False
        if 'date' in df.columns and len(df) >= 3:
            has_real_data = True
            # Group by month and count
            df['month'] = df['date'].dt.to_period('M')
            monthly_counts = df.groupby('month').size()
            
            if len(monthly_counts) >= 3:
                # Prepare data for prediction
                X = np.array(range(len(monthly_counts))).reshape(-1, 1)
                y = monthly_counts.values
                
                # Simple linear regression
                model = LinearRegression()
                model.fit(X, y)
                
                # Predict next 6 months
                next_months = np.array(range(len(monthly_counts), len(monthly_counts) + 6)).reshape(-1, 1)
                predictions = model.fit(X, y).predict(next_months)
                
                # Prepare result data
                result = []
                last_date = monthly_counts.index[-1].to_timestamp()
                
                for i in range(6):
                    next_month = last_date + pd.DateOffset(months=i+1)
                    month_name = next_month.strftime('%b %Y')
                    
                    # Add some randomness to confidence
                    confidence = min(95, 85 - i * 5 + random.randint(-3, 3))
                    
                    result.append({
                        "name": month_name,
                        "expected": max(0, round(predictions[i])),
                        "confidence": confidence
                    })
                
                return result
        
        # Fallback to simulated data
        if not has_real_data:
            result = []
            today = datetime.now()
            
            for i in range(6):
                next_month = today.replace(day=1) + timedelta(days=32 * (i+1))
                next_month = next_month.replace(day=1)
                month_name = next_month.strftime('%b %Y')
                
                # Generate simulated predictions
                import random
                expected = random.randint(20, 60)
                confidence = min(95, 85 - i * 5 + random.randint(-3, 3))
                
                result.append({
                    "name": month_name,
                    "expected": expected,
                    "confidence": confidence
                })
            
            return result
    except Exception as e:
        print(f"Error generating expected volume chart: {e}")
        return []

def generate_resolution_predictions_chart(df, user_role):
    """Generate resolution time predictions"""
    try:
        # Define categories based on user role
        if user_role == 'water-admin':
            categories = ["Leakage", "Shortage", "Quality", "Billing", "Infrastructure"]
        elif user_role == 'energy-admin':
            categories = ["Outages", "Voltage", "Billing", "Street lights", "Transformers"]
        else:
            categories = ["Water", "Energy", "Infrastructure", "Billing", "Other"]
        
        # Generate simulated predictions
        import random
        result = []
        
        for category in categories:
            current = random.randint(1, 6)
            improvement = random.randint(5, 35)
            predicted = max(1, round(current * (100 - improvement) / 100))
            
            result.append({
                "name": category,
                "current": current,
                "predicted": predicted,
                "improvement": improvement
            })
        
        return result
    except Exception as e:
        print(f"Error generating resolution predictions chart: {e}")
        return []

def generate_resource_allocation_chart(df, user_role):
    """Generate resource allocation recommendations"""
    try:
        # Define resources based on user role
        if user_role == 'water-admin':
            resources = ["Leak repairs", "Quality testing", "Infrastructure", "Customer service", "Emergency response"]
        elif user_role == 'energy-admin':
            resources = ["Outage response", "Maintenance", "Grid upgrades", "Customer service", "Smart meters"]
        else:
            resources = ["Water resources", "Energy resources", "Infrastructure", "Customer service", "Administration"]
        
        # Generate simulated recommendations
        import random
        total_current = 0
        total_recommended = 0
        result = []
        
        for i, resource in enumerate(resources):
            # Ensure current allocations add up to 100%
            remaining_current = 100 - total_current
            if i == len(resources) - 1:
                current = remaining_current
            else:
                max_possible = min(40, remaining_current - (len(resources) - i - 1) * 5)
                current = random.randint(5, max_possible)
            
            total_current += current
            
            # Calculate recommended value with some meaningful logic
            if i < 2:  # First two categories get priority boost
                recommended = min(100 - total_recommended, current + random.randint(5, 15))
            elif i == len(resources) - 1:  # Last category balances to 100%
                recommended = 100 - total_recommended
            else:
                recommended = min(100 - total_recommended - (len(resources) - i - 1) * 5, 
                                 max(5, current + random.randint(-10, 10)))
            
            total_recommended += recommended
            
            result.append({
                "name": resource,
                "current": current,
                "recommended": recommended
            })
        
        return result
    except Exception as e:
        print(f"Error generating resource allocation chart: {e}")
        return []

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
