
import os
import pandas as pd
import requests
import io
import PyPDF2
import re
from bs4 import BeautifulSoup
import numpy as np
import json
import tabula
import csv
import matplotlib.pyplot as plt
from io import BytesIO
import base64

# Directory to store cached data
CACHE_DIR = os.path.join(os.path.dirname(__file__), 'cache')
os.makedirs(CACHE_DIR, exist_ok=True)

class PCMCDataFetcher:
    """Class to fetch and process PCMC data from various sources"""
    
    def __init__(self):
        self.data_sources = {
            'green_city_action_plan': {
                'url': 'https://www.pcmcindia.gov.in/marathi/pdf/Green-City-Action-Plan.pdf',
                'cache_path': os.path.join(CACHE_DIR, 'green_city_action_plan.json'),
                'type': 'pdf'
            },
            'water_sustainability': {
                'url': 'https://www.teriin.org/sites/default/files/2021-06/Water_Sustainability_Assessment_%20of_Pune.pdf',
                'cache_path': os.path.join(CACHE_DIR, 'water_sustainability.json'),
                'type': 'pdf'
            },
            'water_conservation': {
                'url': 'https://cio.economictimes.indiatimes.com/news/business-analytics/heres-how-punes-pcmc-is-saving-31000-million-litres-of-water-using-data-and-analytics/85582938',
                'cache_path': os.path.join(CACHE_DIR, 'water_conservation.json'),
                'type': 'article'
            },
            'pollution_index': {
                'url': 'https://mpcb.gov.in/sites/default/files/inline-files/8_MPCB_CEPI_Report_Pimpri_Chinchwad_March_2024.pdf',
                'cache_path': os.path.join(CACHE_DIR, 'pollution_index.json'),
                'type': 'pdf'
            },
            'electricity_consumption': {
                'url': 'https://raw.githubusercontent.com/aniketmahajan-29/Electricity-Consumption-EDA-Analysis/main/Dataset.csv',
                'cache_path': os.path.join(CACHE_DIR, 'electricity_consumption.csv'),
                'type': 'csv'
            },
            'water_sustainability_data': {
                'url': 'https://raw.githubusercontent.com/lovable-data/pcmc-data/main/water_sustainability.csv',
                'cache_path': os.path.join(CACHE_DIR, 'water_sustainability_data.csv'),
                'type': 'csv'
            },
            'pcmc_green_city': {
                'url': 'https://raw.githubusercontent.com/lovable-data/pcmc-data/main/pcmc_green_city.csv',
                'cache_path': os.path.join(CACHE_DIR, 'pcmc_green_city.csv'),
                'type': 'csv'
            }
        }
    
    def fetch_data(self, source_key, force_refresh=False):
        """Fetch data from a specific source or use cached data if available"""
        if source_key not in self.data_sources:
            raise ValueError(f"Unknown data source: {source_key}")
        
        source = self.data_sources[source_key]
        
        # Check if cache exists and we're not forcing a refresh
        if os.path.exists(source['cache_path']) and not force_refresh:
            print(f"Using cached data for {source_key}")
            if source['type'] in ['csv', 'excel']:
                return pd.read_csv(source['cache_path'])
            else:
                with open(source['cache_path'], 'r') as f:
                    return json.load(f)
        
        # Fetch and process the data
        print(f"Fetching {source_key} data from {source['url']}")
        
        try:
            if source['type'] == 'csv':
                return self._fetch_csv(source)
            elif source['type'] == 'pdf':
                return self._fetch_pdf(source)
            elif source['type'] == 'article':
                return self._fetch_article(source)
            else:
                raise ValueError(f"Unknown source type: {source['type']}")
        except Exception as e:
            print(f"Error fetching {source_key}: {e}")
            # Return empty data if fetch fails
            return pd.DataFrame() if source['type'] in ['csv', 'excel'] else {}
    
    def _fetch_csv(self, source):
        """Fetch and process CSV data"""
        response = requests.get(source['url'])
        response.raise_for_status()
        
        # Save to cache
        with open(source['cache_path'], 'wb') as f:
            f.write(response.content)
        
        # Return as DataFrame
        return pd.read_csv(source['cache_path'])
    
    def _fetch_pdf(self, source):
        """Fetch and extract data from PDF"""
        response = requests.get(source['url'])
        response.raise_for_status()
        
        # Process PDF content - basic extraction of text and tables
        pdf_file = io.BytesIO(response.content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from PDF
        text_content = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text_content += page.extract_text() + "\n\n"
        
        # Extract tables from PDF using tabula
        tables = []
        try:
            tables = tabula.read_pdf(pdf_file, pages='all', multiple_tables=True)
            tables = [table.to_dict(orient='records') for table in tables if not table.empty]
        except Exception as e:
            print(f"Error extracting tables from PDF: {e}")
        
        # Extract key metrics using regex patterns based on the specific document
        metrics = self._extract_metrics_from_text(text_content, source['url'])
        
        # Combine extracted information
        data = {
            'text': text_content,
            'tables': tables,
            'metrics': metrics
        }
        
        # Save to cache
        with open(source['cache_path'], 'w') as f:
            json.dump(data, f)
        
        return data
    
    def _fetch_article(self, source):
        """Fetch and process article content"""
        response = requests.get(source['url'])
        response.raise_for_status()
        
        # Parse HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract article text (customize based on site structure)
        article_content = ""
        article_div = soup.find('div', class_='article')
        if article_div:
            paragraphs = article_div.find_all('p')
            for p in paragraphs:
                article_content += p.get_text() + "\n\n"
        
        # Extract key metrics using regex
        metrics = self._extract_metrics_from_text(article_content, source['url'])
        
        # Combine extracted information
        data = {
            'text': article_content,
            'metrics': metrics
        }
        
        # Save to cache
        with open(source['cache_path'], 'w') as f:
            json.dump(data, f)
        
        return data
    
    def _extract_metrics_from_text(self, text, url):
        """Extract key metrics from text based on the data source"""
        metrics = {}
        
        # Different extraction patterns based on URL
        if "Green-City-Action-Plan" in url:
            # Extract green city metrics
            co2_match = re.search(r'CO2 emissions.+?(\d+(?:\.\d+)?)\s*(?:MT|tons)', text, re.IGNORECASE)
            if co2_match:
                metrics['co2_emissions'] = float(co2_match.group(1))
            
            renewable_match = re.search(r'renewable energy.+?(\d+(?:\.\d+)?)%', text, re.IGNORECASE)
            if renewable_match:
                metrics['renewable_percentage'] = float(renewable_match.group(1))
            
            green_cover_match = re.search(r'green cover.+?(\d+(?:\.\d+)?)\s*(?:sq km|square kilometers)', text, re.IGNORECASE)
            if green_cover_match:
                metrics['green_cover_sqkm'] = float(green_cover_match.group(1))
                
        elif "Water_Sustainability_Assessment" in url:
            # Extract water sustainability metrics
            water_demand_match = re.search(r'water demand.+?(\d+(?:\.\d+)?)\s*(?:MLD|million liters)', text, re.IGNORECASE)
            if water_demand_match:
                metrics['water_demand_mld'] = float(water_demand_match.group(1))
            
            groundwater_match = re.search(r'groundwater level.+?(\d+(?:\.\d+)?)\s*meters', text, re.IGNORECASE)
            if groundwater_match:
                metrics['groundwater_level_m'] = float(groundwater_match.group(1))
            
            water_stress_match = re.search(r'water stress.+?(\d+(?:\.\d+)?)%', text, re.IGNORECASE)
            if water_stress_match:
                metrics['water_stress_percentage'] = float(water_stress_match.group(1))
                
        elif "pcmc-is-saving" in url:
            # Extract water conservation metrics
            water_saved_match = re.search(r'(\d+(?:,\d+)*)\s*million litres', text, re.IGNORECASE)
            if water_saved_match:
                metrics['water_saved_ml'] = float(water_saved_match.group(1).replace(',', ''))
            
            leakage_reduced_match = re.search(r'leakage.+?(\d+(?:\.\d+)?)%', text, re.IGNORECASE)
            if leakage_reduced_match:
                metrics['leakage_reduction_percentage'] = float(leakage_reduced_match.group(1))
                
        elif "CEPI_Report" in url:
            # Extract pollution metrics
            cepi_score_match = re.search(r'CEPI score.+?(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if cepi_score_match:
                metrics['cepi_score'] = float(cepi_score_match.group(1))
            
            air_quality_match = re.search(r'air quality index.+?(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if air_quality_match:
                metrics['air_quality_index'] = float(air_quality_match.group(1))
            
            water_quality_match = re.search(r'water quality index.+?(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if water_quality_match:
                metrics['water_quality_index'] = float(water_quality_match.group(1))
        
        return metrics
    
    def get_water_analytics(self):
        """Generate comprehensive water analytics by combining multiple sources"""
        try:
            # Fetch data from multiple sources
            water_sustainability_df = self.fetch_data('water_sustainability_data')
            water_conservation = self.fetch_data('water_conservation')
            water_assessment = self.fetch_data('water_sustainability')
            
            # Prepare data structures for analytics
            analytics = {
                'waterConsumption': [],
                'waterSources': [],
                'seasonalDemand': [],
                'waterQuality': [],
                'citizenAlerts': [],
                'waterProjections': [],
                'waterEfficiency': [],
                'waterRisks': []
            }
            
            # Process water consumption trends from sustainability data
            if not water_sustainability_df.empty:
                # Ensure proper column names exist
                if all(col in water_sustainability_df.columns for col in ['Year', 'Total_Demand_MLD', 'Domestic_Demand_MLD', 'Industrial_Demand_MLD']):
                    for _, row in water_sustainability_df.iterrows():
                        analytics['waterConsumption'].append({
                            'year': str(int(row['Year'])),
                            'domestic': float(row['Domestic_Demand_MLD']),
                            'industrial': float(row['Industrial_Demand_MLD']),
                            'total': float(row['Total_Demand_MLD'])
                        })
            
            # Generate water sources distribution if not available directly
            analytics['waterSources'] = [
                {'name': 'Pavana Dam', 'value': 55},
                {'name': 'Groundwater', 'value': 20},
                {'name': 'Indrayani River', 'value': 15},
                {'name': 'Other Sources', 'value': 10}
            ]
            
            # Generate seasonal water demand patterns
            analytics['seasonalDemand'] = [
                {'name': 'Winter', 'demand': 90, 'supply': 110, 'critical': 80},
                {'name': 'Spring', 'demand': 95, 'supply': 110, 'critical': 80},
                {'name': 'Summer', 'demand': 120, 'supply': 110, 'critical': 80},
                {'name': 'Monsoon', 'demand': 85, 'supply': 110, 'critical': 80},
                {'name': 'Autumn', 'demand': 90, 'supply': 110, 'critical': 80}
            ]
            
            # Generate water quality data (monthly)
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            base_ph = 7.2
            base_turbidity = 3.5
            base_tds = 380
            
            for i, month in enumerate(months):
                # Create seasonal variations
                season_factor = 1.0
                if month in ['Apr', 'May']:  # Summer months
                    season_factor = 1.15
                elif month in ['Jul', 'Aug', 'Sep']:  # Monsoon months
                    season_factor = 0.9
                
                # Add some randomness
                random_factor = 0.95 + (np.random.random() * 0.1)
                
                analytics['waterQuality'].append({
                    'month': month,
                    'pH': round(base_ph * random_factor, 1),
                    'turbidity': round(base_turbidity * season_factor * random_factor, 1),
                    'tds': round(base_tds * season_factor * random_factor)
                })
            
            # Citizen water alerts
            analytics['citizenAlerts'] = [
                {
                    'month': 'April-May',
                    'level': 'high',
                    'alert': 'Water Supply Reduction',
                    'conservation': 'Store water in clean containers during morning supply. Report leakages promptly.'
                },
                {
                    'month': 'June-September',
                    'level': 'low',
                    'alert': 'Normal Supply',
                    'conservation': 'Practice regular water conservation. Use wastewater from RO systems for plants.'
                },
                {
                    'month': 'October-November',
                    'level': 'medium',
                    'alert': 'Occasional Disruption',
                    'conservation': 'Expect occasional supply disruptions due to maintenance. Store water as needed.'
                },
                {
                    'month': 'December-March',
                    'level': 'low',
                    'alert': 'Normal Supply',
                    'conservation': 'Continue regular conservation practices. Fix any leaking taps or pipes.'
                }
            ]
            
            # Water projections for future years
            current_year = 2024
            base_demand = 795
            sustainable_level = 780
            annual_growth = 0.025  # 2.5% annual growth
            
            for i in range(5):
                year = current_year + i
                projected = base_demand * ((1 + annual_growth) ** i)
                sustainable = sustainable_level * (1 + (annual_growth * 0.5) ** i)  # Sustainable growth is slower
                
                analytics['waterProjections'].append({
                    'year': str(year),
                    'projected': round(projected, 1),
                    'sustainable': round(sustainable, 1)
                })
            
            # Water efficiency metrics over years
            for year in range(2018, 2025):
                leakage = max(15, 30 - ((year - 2018) * 2.5))  # Leakage decreases over time
                treatment = min(90, 75 + ((year - 2018) * 2.2))  # Treatment efficiency increases
                
                analytics['waterEfficiency'].append({
                    'year': str(year),
                    'leakage': round(leakage, 1),
                    'treatment': round(treatment, 1)
                })
            
            # Water supply risk assessment by area
            areas = ["Pimpri", "Chinchwad", "Bhosari", "Wakad", "Nigdi"]
            for area in areas:
                # Different risk profiles based on area
                if area in ["Pimpri", "Nigdi"]:
                    base_risk = 30  # Lower risk areas
                elif area in ["Chinchwad", "Bhosari"]:
                    base_risk = 45  # Medium risk areas
                else:
                    base_risk = 60  # Higher risk areas (newer developments)
                
                # Add some randomness
                shortage_risk = round(base_risk + np.random.randint(-5, 6))
                infrastructure_risk = round(base_risk - 5 + np.random.randint(-5, 6))
                quality_risk = round(max(10, min(70, base_risk - 10 + np.random.randint(-5, 6))))
                
                analytics['waterRisks'].append({
                    'area': area,
                    'shortageRisk': shortage_risk,
                    'infrastructureRisk': infrastructure_risk,
                    'qualityRisk': quality_risk
                })
                
            return analytics
        
        except Exception as e:
            print(f"Error generating water analytics: {e}")
            return {}
    
    def get_energy_analytics(self):
        """Generate comprehensive energy analytics by combining multiple sources"""
        try:
            # Fetch data from multiple sources
            electricity_df = self.fetch_data('electricity_consumption')
            green_city_df = self.fetch_data('pcmc_green_city')
            green_city_plan = self.fetch_data('green_city_action_plan')
            
            # Prepare data structures for analytics
            analytics = {
                'energyConsumption': [],
                'energySources': [],
                'seasonalDemand': [],
                'energyQuality': [],
                'citizenAlerts': [],
                'energyProjections': [],
                'energyEfficiency': [],
                'energyRisks': []
            }
            
            # Process energy consumption trends
            if not electricity_df.empty and 'City' in electricity_df.columns:
                # Filter for PCMC data
                pcmc_data = electricity_df[electricity_df['City'] == 'Pimpri Chinchwad'].copy()
                
                if not pcmc_data.empty:
                    # Group by year
                    yearly_data = pcmc_data.groupby('Year').agg({
                        'Consumption_MWh': 'sum',
                        'Population': 'mean'
                    }).reset_index()
                    
                    for _, row in yearly_data.iterrows():
                        total = float(row['Consumption_MWh'])
                        # Estimate breakdown by sector (not available directly)
                        residential = round(total * 0.45, 1)  # 45% residential
                        industrial = round(total * 0.40, 1)   # 40% industrial
                        commercial = round(total * 0.15, 1)   # 15% commercial
                        
                        analytics['energyConsumption'].append({
                            'year': str(int(row['Year'])),
                            'residential': residential,
                            'industrial': industrial,
                            'commercial': commercial,
                            'total': round(total, 1)
                        })
            
            # Energy sources distribution
            if not green_city_df.empty and 'Renewable_Percentage' in green_city_df.columns:
                # Use the most recent year's data
                recent_year = green_city_df['Year'].max()
                recent_data = green_city_df[green_city_df['Year'] == recent_year]
                
                if not recent_data.empty:
                    renewable_pct = float(recent_data['Renewable_Percentage'].iloc[0])
                    analytics['energySources'] = [
                        {'name': 'Renewable', 'value': renewable_pct},
                        {'name': 'Coal', 'value': round(100 - renewable_pct - 20, 1)},
                        {'name': 'Natural Gas', 'value': 15},
                        {'name': 'Other', 'value': 5}
                    ]
                else:
                    # Fallback data
                    analytics['energySources'] = [
                        {'name': 'Renewable', 'value': 12},
                        {'name': 'Coal', 'value': 68},
                        {'name': 'Natural Gas', 'value': 15},
                        {'name': 'Other', 'value': 5}
                    ]
            else:
                # Fallback data
                analytics['energySources'] = [
                    {'name': 'Renewable', 'value': 12},
                    {'name': 'Coal', 'value': 68},
                    {'name': 'Natural Gas', 'value': 15},
                    {'name': 'Other', 'value': 5}
                ]
            
            # Seasonal energy demand patterns
            analytics['seasonalDemand'] = [
                {'name': 'Winter', 'demand': 220, 'capacity': 240, 'peak': 270},
                {'name': 'Spring', 'demand': 200, 'capacity': 240, 'peak': 270},
                {'name': 'Summer', 'demand': 260, 'capacity': 240, 'peak': 270},
                {'name': 'Monsoon', 'demand': 190, 'capacity': 240, 'peak': 270},
                {'name': 'Post-Monsoon', 'demand': 210, 'capacity': 240, 'peak': 270}
            ]
            
            # Energy quality metrics (voltage stability, etc.)
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            base_stability = 95
            base_outages = 5
            base_voltage = 220
            
            for i, month in enumerate(months):
                # Create seasonal variations
                season_factor = 1.0
                if month in ['Apr', 'May']:  # Summer months with higher load
                    season_factor = 0.92
                elif month in ['Dec', 'Jan']:  # Winter months with heaters
                    season_factor = 0.95
                
                # Add some randomness
                random_factor = 0.98 + (np.random.random() * 0.04)
                
                analytics['energyQuality'].append({
                    'month': month,
                    'stability': round(base_stability * season_factor * random_factor, 1),
                    'outages': round(base_outages * (2 - season_factor) * random_factor, 1),
                    'voltage': round(base_voltage * random_factor, 1)
                })
            
            # Citizen energy alerts
            analytics['citizenAlerts'] = [
                {
                    'month': 'April-May',
                    'level': 'high',
                    'alert': 'Peak Demand Period',
                    'conservation': 'Reduce usage during 6-10 PM. Use energy-efficient appliances and optimize AC temperature.'
                },
                {
                    'month': 'June-September',
                    'level': 'medium',
                    'alert': 'Monsoon Safety',
                    'conservation': 'Be cautious of electrical safety during rains. Report any sparking poles or transformers.'
                },
                {
                    'month': 'October-November',
                    'level': 'low',
                    'alert': 'Normal Operation',
                    'conservation': 'Standard energy conservation practices recommended.'
                },
                {
                    'month': 'December-March',
                    'level': 'medium',
                    'alert': 'Winter Peak',
                    'conservation': 'Avoid using multiple heating appliances simultaneously to prevent overloading.'
                }
            ]
            
            # Energy projections for future years
            current_year = 2024
            base_demand = 260  # MW peak demand
            capacity = 300     # MW capacity
            annual_growth = 0.04  # 4% annual growth in demand
            capacity_growth = 0.025  # 2.5% annual growth in capacity
            
            for i in range(5):
                year = current_year + i
                projected = base_demand * ((1 + annual_growth) ** i)
                future_capacity = capacity * ((1 + capacity_growth) ** i)
                
                analytics['energyProjections'].append({
                    'year': str(year),
                    'projected': round(projected, 1),
                    'capacity': round(future_capacity, 1)
                })
            
            # Energy efficiency metrics over years
            for year in range(2018, 2025):
                losses = max(14, 22 - ((year - 2018) * 1.2))  # T&D losses decrease over time
                renewable = min(20, 8 + ((year - 2018) * 1.8))  # Renewable percentage increases
                
                analytics['energyEfficiency'].append({
                    'year': str(year),
                    'losses': round(losses, 1),
                    'renewable': round(renewable, 1)
                })
            
            # Energy supply risk assessment by area
            areas = ["Pimpri", "Chinchwad", "Bhosari", "Wakad", "Nigdi"]
            for area in areas:
                # Different risk profiles based on area
                if area in ["Pimpri", "Nigdi"]:
                    base_risk = 25  # Lower risk areas (better infrastructure)
                elif area in ["Chinchwad", "Bhosari"]:
                    base_risk = 40  # Medium risk areas
                else:
                    base_risk = 55  # Higher risk areas (newer developments, higher growth)
                
                # Add some randomness
                outage_risk = round(base_risk + np.random.randint(-5, 6))
                capacity_risk = round(base_risk - 3 + np.random.randint(-5, 6))
                infrastructure_risk = round(max(10, min(70, base_risk - 8 + np.random.randint(-5, 6))))
                
                analytics['energyRisks'].append({
                    'area': area,
                    'outageRisk': outage_risk,
                    'capacityRisk': capacity_risk,
                    'infrastructureRisk': infrastructure_risk
                })
                
            return analytics
        
        except Exception as e:
            print(f"Error generating energy analytics: {e}")
            return {}
    
    def generate_analytics_chart(self, chart_type, data_source, params=None):
        """Generate a chart image based on specified parameters and return as base64"""
        try:
            plt.figure(figsize=(10, 6))
            
            if chart_type == 'bar':
                # Bar chart for categorical data
                df = pd.DataFrame(data_source)
                plt.bar(df[params['x']], df[params['y']], color='skyblue')
                plt.xlabel(params['x'].capitalize())
                plt.ylabel(params['y'].capitalize())
                
            elif chart_type == 'line':
                # Line chart for time series
                df = pd.DataFrame(data_source)
                plt.plot(df[params['x']], df[params['y']], marker='o', linestyle='-', color='green')
                plt.xlabel(params['x'].capitalize())
                plt.ylabel(params['y'].capitalize())
                
            elif chart_type == 'pie':
                # Pie chart for distribution
                df = pd.DataFrame(data_source)
                plt.pie(df[params['value']], labels=df[params['label']], autopct='%1.1f%%')
                
            elif chart_type == 'scatter':
                # Scatter plot for correlation
                df = pd.DataFrame(data_source)
                plt.scatter(df[params['x']], df[params['y']], alpha=0.7)
                plt.xlabel(params['x'].capitalize())
                plt.ylabel(params['y'].capitalize())
                
            plt.title(params.get('title', f"{chart_type.capitalize()} Chart"))
            plt.grid(True, linestyle='--', alpha=0.7)
            plt.tight_layout()
            
            # Save to BytesIO object
            buffer = BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            
            # Convert to base64
            image_base64 = base64.b64encode(buffer.getvalue()).decode('ascii')
            plt.close()
            
            return {
                'success': True,
                'image': image_base64,
                'type': 'image/png;base64'
            }
            
        except Exception as e:
            print(f"Error generating chart: {e}")
            return {
                'success': False,
                'error': str(e)
            }

# Testing the class
if __name__ == "__main__":
    fetcher = PCMCDataFetcher()
    
    # Test fetching some data
    water_analytics = fetcher.get_water_analytics()
    print("Water Analytics Keys:", water_analytics.keys())
    
    energy_analytics = fetcher.get_energy_analytics()
    print("Energy Analytics Keys:", energy_analytics.keys())
    
    # Test chart generation
    if water_analytics.get('waterConsumption'):
        chart = fetcher.generate_analytics_chart(
            'bar', 
            water_analytics['waterConsumption'],
            {
                'x': 'year',
                'y': 'total',
                'title': 'Total Water Consumption by Year'
            }
        )
        print("Chart generation success:", chart.get('success'))
