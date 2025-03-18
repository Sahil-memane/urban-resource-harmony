
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
        
        if not complaints:
            return jsonify({"error": "No complaints data provided"}), 400
        
        print(f"Generating analytics for {len(complaints)} complaints")
        
        # Generate charts
        category_chart = generate_category_chart(complaints)
        priority_chart = generate_priority_chart(complaints)
        trends_chart = generate_trends_chart(complaints)
        resolution_chart = generate_resolution_chart(complaints)
        
        return jsonify({
            "categoryChart": category_chart,
            "priorityChart": priority_chart,
            "trendsChart": trends_chart,
            "resolutionChart": resolution_chart
        })
    
    except Exception as e:
        print(f"Error in generate_analytics endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

def generate_category_chart(complaints):
    """Generate a pie chart showing complaints by category"""
    try:
        categories = [complaint.get('category', 'unknown') for complaint in complaints]
        category_counts = Counter(categories)
        
        # Create a pie chart
        plt.figure(figsize=(8, 6))
        plt.pie(
            category_counts.values(), 
            labels=category_counts.keys(),
            autopct='%1.1f%%',
            startangle=90,
            colors=['#4299e1', '#f6ad55']
        )
        plt.title('Complaints by Category')
        plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
        
        # Convert plot to base64 string
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"Error generating category chart: {e}")
        return None

def generate_priority_chart(complaints):
    """Generate a bar chart showing complaints by priority"""
    try:
        priorities = [complaint.get('priority', 'unknown') for complaint in complaints]
        priority_counts = Counter(priorities)
        
        # Sort priorities in a meaningful order
        sorted_priorities = []
        sorted_counts = []
        for priority in ['high', 'medium', 'low']:
            if priority in priority_counts:
                sorted_priorities.append(priority)
                sorted_counts.append(priority_counts[priority])
        
        # Add any other priorities not in the expected list
        for priority, count in priority_counts.items():
            if priority not in ['high', 'medium', 'low']:
                sorted_priorities.append(priority)
                sorted_counts.append(count)
        
        # Create a bar chart
        plt.figure(figsize=(8, 6))
        colors = {'high': '#f56565', 'medium': '#ed8936', 'low': '#48bb78'}
        bar_colors = [colors.get(p, '#a0aec0') for p in sorted_priorities]
        
        bars = plt.bar(sorted_priorities, sorted_counts, color=bar_colors)
        plt.title('Complaints by Priority')
        plt.xlabel('Priority')
        plt.ylabel('Number of Complaints')
        
        # Add count labels on top of bars
        for bar in bars:
            height = bar.get_height()
            plt.text(
                bar.get_x() + bar.get_width()/2.,
                height + 0.1,
                str(int(height)),
                ha='center'
            )
        
        # Convert plot to base64 string
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"Error generating priority chart: {e}")
        return None

def generate_trends_chart(complaints):
    """Generate a line chart showing complaint trends over time"""
    try:
        # Extract dates and convert to datetime objects
        dates = []
        for complaint in complaints:
            date_str = complaint.get('date')
            if date_str:
                try:
                    # Try to parse the date - format may vary
                    if 'T' in date_str:
                        # ISO format
                        date = datetime.fromisoformat(date_str.split('T')[0])
                    else:
                        # Try other formats
                        date = datetime.strptime(date_str.split(' ')[0], '%Y-%m-%d')
                    dates.append(date)
                except (ValueError, TypeError):
                    continue
        
        if not dates:
            # No valid dates found
            # Create some mock data
            now = datetime.now()
            dates = []
            for i in range(6):
                dates.append(now - timedelta(days=30*i))
        
        # Group complaints by month
        months_counter = defaultdict(int)
        for date in dates:
            month_key = date.strftime('%Y-%m')
            months_counter[month_key] += 1
        
        # Sort months chronologically
        sorted_months = sorted(months_counter.keys())
        counts = [months_counter[month] for month in sorted_months]
        
        # Format month labels to be more readable
        display_labels = [datetime.strptime(m, '%Y-%m').strftime('%b %Y') for m in sorted_months]
        
        # Create a line chart
        plt.figure(figsize=(10, 6))
        plt.plot(display_labels, counts, marker='o', linestyle='-', color='#4299e1', linewidth=2)
        plt.title('Monthly Complaint Trends')
        plt.xlabel('Month')
        plt.ylabel('Number of Complaints')
        plt.grid(True, linestyle='--', alpha=0.7)
        
        # Rotate x-axis labels for better readability
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        # Add values above points
        for i, count in enumerate(counts):
            plt.text(i, count + 0.3, str(count), ha='center')
        
        # Convert plot to base64 string
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"Error generating trends chart: {e}")
        return None

def generate_resolution_chart(complaints):
    """Generate a bar chart showing average resolution time by category"""
    try:
        # Filter complaints with both date and resolved_date
        resolved_complaints = []
        for complaint in complaints:
            date_str = complaint.get('date')
            resolved_date_str = complaint.get('resolved_date')
            category = complaint.get('category')
            
            if date_str and resolved_date_str and category:
                try:
                    # Parse dates
                    if 'T' in date_str:
                        date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    else:
                        date = datetime.strptime(date_str, '%Y-%m-%d')
                        
                    if 'T' in resolved_date_str:
                        resolved_date = datetime.fromisoformat(resolved_date_str.replace('Z', '+00:00'))
                    else:
                        resolved_date = datetime.strptime(resolved_date_str, '%Y-%m-%d')
                    
                    days_to_resolve = (resolved_date - date).days
                    if days_to_resolve >= 0:  # Ensure valid duration
                        resolved_complaints.append({
                            'category': category,
                            'days_to_resolve': days_to_resolve
                        })
                except (ValueError, TypeError) as e:
                    print(f"Date parsing error: {e}")
                    continue
        
        # Generate mock data if no complaints are resolved
        if not resolved_complaints:
            categories = ['water', 'energy']
            avg_days = [3.5, 5.2]  # Mock average resolution times in days
            
            # Create a bar chart
            plt.figure(figsize=(8, 6))
            colors = {'water': '#4299e1', 'energy': '#f6ad55'}
            bar_colors = [colors.get(c, '#a0aec0') for c in categories]
            
            bars = plt.bar(categories, avg_days, color=bar_colors)
            plt.title('Average Resolution Time by Category (Simulated)')
            plt.xlabel('Category')
            plt.ylabel('Average Days to Resolve')
            
            # Add average day labels on top of bars
            for bar in bars:
                height = bar.get_height()
                plt.text(
                    bar.get_x() + bar.get_width()/2.,
                    height + 0.1,
                    f"{height:.1f}",
                    ha='center'
                )
            
        else:
            # Calculate average resolution time by category
            category_resolution = defaultdict(list)
            for complaint in resolved_complaints:
                category_resolution[complaint['category']].append(complaint['days_to_resolve'])
            
            categories = list(category_resolution.keys())
            avg_days = [sum(days)/len(days) for days in category_resolution.values()]
            
            # Create a bar chart
            plt.figure(figsize=(8, 6))
            colors = {'water': '#4299e1', 'energy': '#f6ad55'}
            bar_colors = [colors.get(c, '#a0aec0') for c in categories]
            
            bars = plt.bar(categories, avg_days, color=bar_colors)
            plt.title('Average Resolution Time by Category')
            plt.xlabel('Category')
            plt.ylabel('Average Days to Resolve')
            
            # Add average day labels on top of bars
            for bar in bars:
                height = bar.get_height()
                plt.text(
                    bar.get_x() + bar.get_width()/2.,
                    height + 0.1,
                    f"{height:.1f}",
                    ha='center'
                )
        
        # Convert plot to base64 string
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"Error generating resolution chart: {e}")
        return None

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
