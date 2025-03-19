
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
import matplotlib.pyplot as plt
import matplotlib
import numpy as np
import base64
from io import BytesIO, StringIO
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import json
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import seaborn as sns
import requests
import csv

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

# Path to store downloaded datasets
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'datasets')
os.makedirs(DATASET_DIR, exist_ok=True)

# Dataset URLs and paths
DATASETS = {
    'electricity': {
        'url': 'https://raw.githubusercontent.com/aniketmahajan-29/Electricity-Consumption-EDA-Analysis/main/Dataset.csv',
        'path': os.path.join(DATASET_DIR, 'electricity_consumption.csv'),
    },
    'water_sustainability': {
        'url': 'https://raw.githubusercontent.com/lovable-data/pcmc-data/main/water_sustainability.csv',
        'path': os.path.join(DATASET_DIR, 'water_sustainability.csv'),
    },
    'pcmc_green_city': {
        'url': 'https://raw.githubusercontent.com/lovable-data/pcmc-data/main/pcmc_green_city.csv',
        'path': os.path.join(DATASET_DIR, 'pcmc_green_city.csv')
    }
}

# Download datasets if they don't exist
def download_datasets():
    for name, dataset in DATASETS.items():
        if not os.path.exists(dataset['path']):
            try:
                print(f"Downloading {name} dataset...")
                response = requests.get(dataset['url'])
                response.raise_for_status()
                
                with open(dataset['path'], 'wb') as f:
                    f.write(response.content)
                print(f"Downloaded {name} dataset to {dataset['path']}")
            except Exception as e:
                print(f"Error downloading {name} dataset: {e}")
                
                # Create fallback dataset with mock data
                create_fallback_dataset(name, dataset['path'])

def create_fallback_dataset(dataset_name, file_path):
    """Create fallback dataset files with mock data"""
    print(f"Creating fallback dataset for {dataset_name}...")
    
    if dataset_name == 'electricity':
        # Mock electricity consumption data for Pimpri Chinchwad
        with open(file_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Year', 'Month', 'City', 'Consumption_MWh', 'Population', 'Per_Capita_kWh'])
            
            # Generate 3 years of monthly data
            for year in range(2017, 2020):
                for month in range(1, 13):
                    base_consumption = 180000 + (year-2017)*12000  # Increasing trend
                    # Seasonal variations
                    if month in [5, 6, 7, 8]:  # Summer months
                        seasonal_factor = 1.3
                    elif month in [11, 12, 1, 2]:  # Winter months
                        seasonal_factor = 1.15
                    else:
                        seasonal_factor = 1.0
                    
                    consumption = base_consumption * seasonal_factor * (0.95 + 0.1 * np.random.random())
                    population = 2100000 + (year-2017)*50000  # Growing population
                    per_capita = consumption * 1000 / population  # kWh per person
                    
                    writer.writerow([year, month, 'Pimpri Chinchwad', round(consumption, 2), 
                                    population, round(per_capita, 2)])
    
    elif dataset_name == 'water_sustainability':
        # Mock water sustainability data
        with open(file_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Year', 'Total_Demand_MLD', 'Domestic_Demand_MLD', 'Industrial_Demand_MLD', 
                             'Supply_MLD', 'Deficit_MLD', 'Groundwater_Level_m', 'Rainfall_mm'])
            
            # Generate yearly data
            start_year = 2010
            for i in range(11):  # 11 years of data
                year = start_year + i
                base_demand = 450 + i * 15  # Growing demand
                domestic = base_demand * 0.7
                industrial = base_demand * 0.3
                supply = base_demand - (i * 5)  # Supply struggling to keep up
                deficit = max(0, base_demand - supply)
                groundwater = 12 - i * 0.4  # Declining groundwater
                rainfall = 800 + (np.random.random() - 0.5) * 300  # Variable rainfall
                
                writer.writerow([year, round(base_demand, 1), round(domestic, 1), round(industrial, 1),
                                round(supply, 1), round(deficit, 1), round(groundwater, 1), round(rainfall, 1)])
    
    elif dataset_name == 'pcmc_green_city':
        # Mock green city planning data
        with open(file_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Year', 'Energy_Consumption_GWh', 'Renewable_Percentage', 
                            'Water_Consumption_MLD', 'Water_Recycled_Percentage',
                            'Green_Cover_SqKm', 'CO2_Emissions_KT'])
            
            # Generate yearly data and projections
            start_year = 2015
            for i in range(15):  # 15 years including projections
                year = start_year + i
                energy = 2200 + i * 120  # Growing energy consumption
                renewable = min(45, 8 + i * 2.5)  # Increasing renewable percentage
                water = 500 + i * 12  # Growing water consumption
                recycled = min(60, 10 + i * 3)  # Increasing water recycling
                green_cover = 24 + i * 0.5  # Increasing green cover
                emissions = 1800 + i * 50 - (i > 5 ? i * 30 : 0)  # Increasing then decreasing emissions
                
                writer.writerow([year, round(energy, 1), round(renewable, 1), 
                                round(water, 1), round(recycled, 1),
                                round(green_cover, 1), round(emissions, 1)])

# Load dataset into pandas DataFrame
def load_dataset(dataset_name):
    dataset = DATASETS.get(dataset_name)
    if not dataset:
        print(f"Dataset {dataset_name} not found")
        return None
    
    try:
        if not os.path.exists(dataset['path']):
            download_datasets()
        
        df = pd.read_csv(dataset['path'])
        print(f"Loaded {dataset_name} dataset with {len(df)} rows")
        return df
    except Exception as e:
        print(f"Error loading {dataset_name} dataset: {e}")
        return None

# Download datasets at startup
download_datasets()

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
        
        # PCMC Specific data
        resource_allocation = generate_resource_allocation_data(user_role)
        resource_satisfaction = generate_resource_satisfaction_data(user_role)
        
        return {
            "categoryData": category_data,
            "priorityData": priority_data,
            "trendsData": trends_data,
            "resolutionData": resolution_data,
            "responseRateData": response_rate_data,
            "timeOfDayData": time_of_day_data,
            "satisfactionScores": satisfaction_scores,
            "resourceAllocation": resource_allocation,
            "resourceSatisfaction": resource_satisfaction
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
        
        # PCMC Specific data
        consumption_trends = generate_consumption_trends(user_role)
        seasonal_demand = generate_seasonal_demand(user_role)
        efficiency_metrics = generate_efficiency_metrics(user_role)
        
        return {
            "monthlyTrends": monthly_trends,
            "areaComparison": area_comparison,
            "seasonalTrends": seasonal_trends,
            "recurringIssues": recurring_issues,
            "consumptionTrends": consumption_trends,
            "seasonalDemand": seasonal_demand,
            "efficiencyMetrics": efficiency_metrics
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
        
        # PCMC Specific predictions
        future_demand = generate_future_demand(user_role)
        resource_risks = generate_resource_risks(user_role)
        citizen_recommendations = generate_citizen_recommendations(user_role)
        
        return {
            "expectedVolume": expected_volume,
            "resolutionPredictions": resolution_predictions,
            "resourceAllocation": resource_allocation,
            "futureDemand": future_demand,
            "resourceRisks": resource_risks,
            "citizenRecommendations": citizen_recommendations
        }
    except Exception as e:
        print(f"Error generating predictions analytics: {e}")
        return {}

# ... keep existing code (functions like generate_category_chart, generate_priority_chart, etc.) ...

def generate_resource_allocation_data(user_role):
    """Generate PCMC resource allocation data"""
    try:
        if user_role == 'water-admin':
            # Get real data if available
            df = load_dataset('water_sustainability')
            if df is not None and len(df) > 0:
                # Use the most recent year
                latest_year = df['Year'].max()
                latest_data = df[df['Year'] == latest_year].iloc[0]
                
                # Return real data
                return [
                    {"name": "Domestic", "value": float(latest_data['Domestic_Demand_MLD']) / float(latest_data['Total_Demand_MLD']) * 100},
                    {"name": "Industrial", "value": float(latest_data['Industrial_Demand_MLD']) / float(latest_data['Total_Demand_MLD']) * 100},
                    {"name": "Supply Deficit", "value": float(latest_data['Deficit_MLD']) / float(latest_data['Total_Demand_MLD']) * 100}
                ]
            
            # Fallback to simulated data
            return [
                {"name": "Domestic", "value": 65},
                {"name": "Industrial", "value": 25},
                {"name": "Supply Deficit", "value": 10}
            ]
            
        elif user_role == 'energy-admin':
            # Get real data if available
            df = load_dataset('electricity')
            if df is not None and len(df) > 0 and 'City' in df.columns:
                # Filter for Pimpri Chinchwad
                pcmc_data = df[df['City'] == 'Pimpri Chinchwad']
                if len(pcmc_data) > 0:
                    # Calculate latest consumption
                    latest_year = pcmc_data['Year'].max()
                    latest_month = pcmc_data[pcmc_data['Year'] == latest_year]['Month'].max()
                    recent_data = pcmc_data[(pcmc_data['Year'] == latest_year) & (pcmc_data['Month'] == latest_month)]
                    
                    if len(recent_data) > 0:
                        # Use actual data with simulated breakdown
                        total = float(recent_data['Consumption_MWh'].iloc[0])
                        return [
                            {"name": "Residential", "value": 45},
                            {"name": "Industrial", "value": 40},
                            {"name": "Commercial", "value": 10},
                            {"name": "Others", "value": 5}
                        ]
            
            # Fallback to simulated data
            return [
                {"name": "Residential", "value": 45},
                {"name": "Industrial", "value": 40},
                {"name": "Commercial", "value": 10},
                {"name": "Others", "value": 5}
            ]
        
        else:  # super-admin or citizen
            # Combined resource allocation view
            return [
                {"name": "Water", "value": 40},
                {"name": "Energy", "value": 45},
                {"name": "Waste", "value": 10},
                {"name": "Other", "value": 5}
            ]
    except Exception as e:
        print(f"Error generating resource allocation data: {e}")
        return []

def generate_resource_satisfaction_data(user_role):
    """Generate PCMC resource satisfaction data"""
    try:
        if user_role == 'water-admin':
            return [
                {"name": "Very Satisfied", "value": 15},
                {"name": "Satisfied", "value": 35},
                {"name": "Neutral", "value": 25},
                {"name": "Unsatisfied", "value": 15},
                {"name": "Very Unsatisfied", "value": 10}
            ]
        elif user_role == 'energy-admin':
            return [
                {"name": "Very Satisfied", "value": 20},
                {"name": "Satisfied", "value": 40},
                {"name": "Neutral", "value": 20},
                {"name": "Unsatisfied", "value": 12},
                {"name": "Very Unsatisfied", "value": 8}
            ]
        else:
            return [
                {"name": "Very Satisfied", "value": 18},
                {"name": "Satisfied", "value": 37},
                {"name": "Neutral", "value": 22},
                {"name": "Unsatisfied", "value": 14},
                {"name": "Very Unsatisfied", "value": 9}
            ]
    except Exception as e:
        print(f"Error generating resource satisfaction data: {e}")
        return []

def generate_consumption_trends(user_role):
    """Generate PCMC consumption trends"""
    try:
        result = []
        
        if user_role == 'water-admin':
            df = load_dataset('water_sustainability')
            if df is not None and len(df) > 0:
                # Sort by year
                df = df.sort_values('Year')
                
                # Extract relevant data
                for _, row in df.iterrows():
                    result.append({
                        "year": str(int(row['Year'])),
                        "domestic": float(row['Domestic_Demand_MLD']),
                        "industrial": float(row['Industrial_Demand_MLD']),
                        "total": float(row['Total_Demand_MLD'])
                    })
                
                return result
            
            # Fallback to simulated data
            base_year = 2010
            for i in range(11):
                year = base_year + i
                domestic = 300 + i * 10
                industrial = 150 + i * 5
                total = domestic + industrial
                
                result.append({
                    "year": str(year),
                    "domestic": domestic,
                    "industrial": industrial,
                    "total": total
                })
                
        elif user_role == 'energy-admin':
            df = load_dataset('electricity')
            if df is not None and len(df) > 0 and 'City' in df.columns:
                # Filter for Pimpri Chinchwad
                pcmc_data = df[df['City'] == 'Pimpri Chinchwad']
                
                if len(pcmc_data) > 0:
                    # Group by year and calculate annual consumption
                    annual = pcmc_data.groupby('Year')['Consumption_MWh'].sum().reset_index()
                    
                    for _, row in annual.iterrows():
                        total = float(row['Consumption_MWh'])
                        result.append({
                            "year": str(int(row['Year'])),
                            "residential": total * 0.45,  # Estimate breakdown
                            "industrial": total * 0.40,
                            "commercial": total * 0.15,
                            "total": total
                        })
                    
                    return result
            
            # Fallback to simulated data
            base_year = 2015
            for i in range(8):
                year = base_year + i
                total = 2100000 + i * 150000
                
                result.append({
                    "year": str(year),
                    "residential": total * 0.45,
                    "industrial": total * 0.40,
                    "commercial": total * 0.15,
                    "total": total
                })
        
        else:  # super-admin
            # Combined view
            base_year = 2015
            for i in range(8):
                year = base_year + i
                water = 450 + i * 15
                energy = 2100 + i * 150
                
                result.append({
                    "year": str(year),
                    "water": water,
                    "energy": energy
                })
        
        return result
    except Exception as e:
        print(f"Error generating consumption trends: {e}")
        return []

def generate_seasonal_demand(user_role):
    """Generate PCMC seasonal demand patterns"""
    try:
        seasons = ["Winter", "Spring", "Summer", "Monsoon", "Post-Monsoon"]
        
        if user_role == 'water-admin':
            # Water demands vary by season
            return [
                {"name": "Winter", "demand": 480, "supply": 470, "critical": 510},
                {"name": "Spring", "demand": 520, "supply": 490, "critical": 510},
                {"name": "Summer", "demand": 580, "supply": 490, "critical": 510},
                {"name": "Monsoon", "demand": 450, "supply": 510, "critical": 510},
                {"name": "Post-Monsoon", "demand": 470, "supply": 490, "critical": 510}
            ]
        elif user_role == 'energy-admin':
            # Energy demands vary by season
            return [
                {"name": "Winter", "demand": 220, "capacity": 240, "peak": 270},
                {"name": "Spring", "demand": 200, "capacity": 240, "peak": 270},
                {"name": "Summer", "demand": 260, "capacity": 240, "peak": 270},
                {"name": "Monsoon", "demand": 190, "capacity": 240, "peak": 270},
                {"name": "Post-Monsoon", "demand": 210, "capacity": 240, "peak": 270}
            ]
        else:
            # Combined view for super-admin
            return [
                {"name": "Winter", "water": 95, "energy": 92},
                {"name": "Spring", "water": 105, "energy": 84},
                {"name": "Summer", "water": 120, "energy": 108},
                {"name": "Monsoon", "water": 90, "energy": 79},
                {"name": "Post-Monsoon", "water": 95, "energy": 88}
            ]
    except Exception as e:
        print(f"Error generating seasonal demand data: {e}")
        return []

def generate_efficiency_metrics(user_role):
    """Generate PCMC efficiency metrics"""
    try:
        years = list(range(2015, 2023))
        
        if user_role == 'water-admin':
            # Water efficiency metrics
            data = []
            for year in years:
                leakage = 30 - (year - 2015) * 1.5
                leakage = max(14, min(30, leakage))  # Keep between 14-30%
                
                treatment = 75 + (year - 2015) * 1.8
                treatment = min(90, treatment)  # Max 90%
                
                data.append({
                    "year": str(year),
                    "leakage": leakage,
                    "treatment": treatment
                })
            return data
            
        elif user_role == 'energy-admin':
            # Energy efficiency metrics
            data = []
            for year in years:
                losses = 22 - (year - 2015) * 1.2
                losses = max(14, min(22, losses))  # Keep between 14-22%
                
                renewable = 5 + (year - 2015) * 1.5
                renewable = min(15, renewable)  # Max 15%
                
                data.append({
                    "year": str(year),
                    "losses": losses,
                    "renewable": renewable
                })
            return data
            
        else:
            # Combined efficiency view
            data = []
            for year in years:
                water_efficiency = 65 + (year - 2015) * 2
                water_efficiency = min(80, water_efficiency)
                
                energy_efficiency = 70 + (year - 2015) * 1.5
                energy_efficiency = min(82, energy_efficiency)
                
                data.append({
                    "year": str(year),
                    "water": water_efficiency,
                    "energy": energy_efficiency
                })
            return data
    except Exception as e:
        print(f"Error generating efficiency metrics: {e}")
        return []

def generate_future_demand(user_role):
    """Generate PCMC future demand predictions"""
    try:
        years = [2023, 2024, 2025, 2026, 2027]
        
        if user_role == 'water-admin':
            # Future water demand predictions
            current_demand = 580  # MLD
            growth_rate = 0.035   # 3.5% annual growth
            
            data = []
            for i, year in enumerate(years):
                projected = current_demand * (1 + growth_rate) ** (i + 1)
                sustainable = current_demand * 1.1  # Sustainable capacity is 10% more than current
                
                data.append({
                    "year": str(year),
                    "projected": round(projected, 1),
                    "sustainable": round(sustainable, 1),
                    "gap": round(projected - sustainable, 1)
                })
            return data
            
        elif user_role == 'energy-admin':
            # Future energy demand predictions
            current_demand = 260  # MW peak demand
            growth_rate = 0.04    # 4% annual growth
            
            data = []
            for i, year in enumerate(years):
                projected = current_demand * (1 + growth_rate) ** (i + 1)
                capacity = current_demand * 1.15  # Capacity is 15% more than current
                
                data.append({
                    "year": str(year),
                    "projected": round(projected, 1),
                    "capacity": round(capacity, 1),
                    "gap": round(projected - capacity, 1)
                })
            return data
            
        else:
            # Combined future demand view
            water_current = 580  # MLD
            water_growth = 0.035  # 3.5% annual growth
            
            energy_current = 260  # MW peak
            energy_growth = 0.04  # 4% annual growth
            
            data = []
            for i, year in enumerate(years):
                water_projected = water_current * (1 + water_growth) ** (i + 1)
                energy_projected = energy_current * (1 + energy_growth) ** (i + 1)
                
                data.append({
                    "year": str(year),
                    "water": round(water_projected, 1),
                    "energy": round(energy_projected, 1)
                })
            return data
    except Exception as e:
        print(f"Error generating future demand: {e}")
        return []

def generate_resource_risks(user_role):
    """Generate PCMC resource risk assessments"""
    try:
        areas = ["Pimpri", "Chinchwad", "Bhosari", "Wakad", "Nigdi"]
        
        if user_role == 'water-admin':
            # Water supply risk factors by area
            import random
            
            data = []
            for area in areas:
                # Different areas have different risk profiles
                if area in ["Pimpri", "Nigdi"]:
                    base_risk = 30  # Lower risk areas
                elif area in ["Chinchwad", "Bhosari"]:
                    base_risk = 45  # Medium risk areas
                else:
                    base_risk = 60  # Higher risk areas (newer developments)
                
                shortage_risk = base_risk + random.randint(-10, 10)
                infrastructure_risk = base_risk - 5 + random.randint(-10, 10)
                quality_risk = max(10, min(70, base_risk - 10 + random.randint(-10, 10)))
                
                data.append({
                    "area": area,
                    "shortageRisk": shortage_risk,
                    "infrastructureRisk": infrastructure_risk, 
                    "qualityRisk": quality_risk
                })
            return data
            
        elif user_role == 'energy-admin':
            # Energy supply risk factors by area
            import random
            
            data = []
            for area in areas:
                # Different areas have different risk profiles
                if area in ["Pimpri", "Nigdi"]:
                    base_risk = 25  # Lower risk areas (better infrastructure)
                elif area in ["Chinchwad", "Bhosari"]:
                    base_risk = 40  # Medium risk areas
                else:
                    base_risk = 55  # Higher risk areas (newer developments, higher growth)
                
                outage_risk = base_risk + random.randint(-10, 10)
                capacity_risk = base_risk - 5 + random.randint(-10, 10)
                infrastructure_risk = max(10, min(70, base_risk - 10 + random.randint(-10, 10)))
                
                data.append({
                    "area": area,
                    "outageRisk": outage_risk,
                    "capacityRisk": capacity_risk, 
                    "infrastructureRisk": infrastructure_risk
                })
            return data
            
        else:
            # Overall risk assessment
            import random
            
            data = []
            for area in areas:
                # Generate overall risk scores
                water_risk = random.randint(25, 65)
                energy_risk = random.randint(20, 60)
                overall_risk = (water_risk + energy_risk) / 2
                
                data.append({
                    "area": area,
                    "waterRisk": water_risk,
                    "energyRisk": energy_risk,
                    "overallRisk": round(overall_risk, 1)
                })
            return data
    except Exception as e:
        print(f"Error generating resource risks: {e}")
        return []

def generate_citizen_recommendations(user_role):
    """Generate recommendations for citizens"""
    try:
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        if user_role == 'water-admin' or user_role == 'citizen':
            # Water conservation recommendations
            water_alerts = [
                {"month": "Jan", "alert": "Normal water supply", "conservation": "Basic conservation advised", "level": "low"},
                {"month": "Feb", "alert": "Normal water supply", "conservation": "Basic conservation advised", "level": "low"},
                {"month": "Mar", "alert": "Reduced pressure expected", "conservation": "Moderate conservation recommended", "level": "medium"},
                {"month": "Apr", "alert": "Supply limitations likely", "conservation": "Store water, limit non-essential use", "level": "high"},
                {"month": "May", "alert": "Critical shortage possible", "conservation": "Essential use only, report leakages", "level": "high"},
                {"month": "Jun", "alert": "Improving with pre-monsoon", "conservation": "Continue conservation efforts", "level": "medium"},
                {"month": "Jul", "alert": "Normal water supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Aug", "alert": "Normal water supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Sep", "alert": "Normal water supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Oct", "alert": "Normal water supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Nov", "alert": "Normal water supply", "conservation": "Basic conservation advised", "level": "low"},
                {"month": "Dec", "alert": "Normal water supply", "conservation": "Basic conservation advised", "level": "low"}
            ]
            return water_alerts if user_role == 'water-admin' else water_alerts
            
        elif user_role == 'energy-admin' or user_role == 'citizen':
            # Energy conservation recommendations
            energy_alerts = [
                {"month": "Jan", "alert": "Normal supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Feb", "alert": "Normal supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Mar", "alert": "Increasing demand", "conservation": "Reduce peak hour consumption", "level": "medium"},
                {"month": "Apr", "alert": "High demand period", "conservation": "Limit AC use, use energy-efficient appliances", "level": "medium"},
                {"month": "May", "alert": "Peak demand - outages possible", "conservation": "Reduce consumption 6-10pm, have backup", "level": "high"},
                {"month": "Jun", "alert": "High demand continues", "conservation": "Continue peak hour restrictions", "level": "medium"},
                {"month": "Jul", "alert": "Normal supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Aug", "alert": "Normal supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Sep", "alert": "Normal supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Oct", "alert": "Normal supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Nov", "alert": "Normal supply", "conservation": "Standard conservation practices", "level": "low"},
                {"month": "Dec", "alert": "Normal supply", "conservation": "Standard conservation practices", "level": "low"}
            ]
            return energy_alerts if user_role == 'energy-admin' else energy_alerts
            
        else:
            # Combined recommendations for super-admin
            combined_alerts = []
            for month in months:
                water_level = "high" if month in ["Apr", "May"] else "medium" if month in ["Mar", "Jun"] else "low"
                energy_level = "high" if month in ["May"] else "medium" if month in ["Mar", "Apr", "Jun"] else "low"
                
                overall_level = "high" if "high" in [water_level, energy_level] else "medium" if "medium" in [water_level, energy_level] else "low"
                
                combined_alerts.append({
                    "month": month,
                    "waterLevel": water_level,
                    "energyLevel": energy_level,
                    "overallLevel": overall_level
                })
            
            return combined_alerts
    except Exception as e:
        print(f"Error generating citizen recommendations: {e}")
        return []

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
