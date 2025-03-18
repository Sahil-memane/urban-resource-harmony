
from flask import Flask, request, jsonify
import google.generativeai as genai
import os
import json
from flask_cors import CORS
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Configure Google Generative AI with your API key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY environment variable not set")

# System prompt for the chatbot
SYSTEM_PROMPT = """
You are a helpful assistant for a citizen services portal focusing on water and energy services.
Your name is CityAssist and you help users navigate the portal and submit complaints.

You can help users with:
- Understanding how to submit complaints about water or energy services
- Explaining the complaint tracking system
- Navigating to different parts of the portal
- Explaining priority levels for complaints

Be concise, friendly, and helpful. If you don't know something, say so.
"""

@app.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.json
        if not data or 'message' not in data:
            return jsonify({"error": "Missing message"}), 400
        
        message = data.get('message')
        chat_history = data.get('chatHistory', [])
        
        print(f"Received chatbot request: {message}")
        
        # Configure the model
        model = genai.GenerativeModel('gemini-pro')
        
        # Prepare the chat
        chat = model.start_chat(history=[])
        
        # Add system prompt as the first message
        chat.send_message(SYSTEM_PROMPT)
        
        # Add chat history if available
        for entry in chat_history:
            if entry.get('role') and entry.get('content'):
                role = entry.get('role')
                content = entry.get('content')
                if role == 'user':
                    chat.send_message(content)
                # For assistant messages, we don't add them as they're already part of the chat context
        
        # Send the user's message and get the response
        response = chat.send_message(message)
        
        print(f"Generated response: {response.text}")
        
        return jsonify({"response": response.text})
    
    except Exception as e:
        print(f"Error in chatbot endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_analytics', methods=['POST'])
def generate_analytics():
    try:
        data = request.json
        complaints = data.get('complaints', [])
        
        if not complaints:
            return jsonify({"error": "No complaints data provided"}), 400
        
        # Generate analytics using matplotlib
        analytics_data = {}
        
        # 1. Complaints by Category
        categories = {}
        for complaint in complaints:
            category = complaint.get('category')
            if category:
                categories[category] = categories.get(category, 0) + 1
        
        # Create pie chart for categories
        plt.figure(figsize=(10, 6))
        labels = list(categories.keys())
        sizes = list(categories.values())
        colors = ['#3b82f6', '#eab308']
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        plt.axis('equal')
        plt.title('Complaints by Category')
        
        # Save to bytes
        category_img = io.BytesIO()
        plt.savefig(category_img, format='png')
        category_img.seek(0)
        category_chart = base64.b64encode(category_img.getvalue()).decode('utf-8')
        plt.close()
        
        # 2. Complaints by Priority
        priorities = {}
        for complaint in complaints:
            priority = complaint.get('priority')
            if priority:
                priorities[priority] = priorities.get(priority, 0) + 1
        
        # Create pie chart for priorities
        plt.figure(figsize=(10, 6))
        labels = list(priorities.keys())
        sizes = list(priorities.values())
        colors = ['#ef4444', '#3b82f6', '#22c55e']
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        plt.axis('equal')
        plt.title('Complaints by Priority')
        
        # Save to bytes
        priority_img = io.BytesIO()
        plt.savefig(priority_img, format='png')
        priority_img.seek(0)
        priority_chart = base64.b64encode(priority_img.getvalue()).decode('utf-8')
        plt.close()
        
        # 3. Monthly Complaint Trends
        monthly_data = {}
        for complaint in complaints:
            date_str = complaint.get('date')
            if date_str:
                try:
                    date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    month = date.strftime('%b')
                    category = complaint.get('category')
                    if month not in monthly_data:
                        monthly_data[month] = {'water': 0, 'energy': 0}
                    if category == 'water':
                        monthly_data[month]['water'] += 1
                    elif category == 'energy':
                        monthly_data[month]['energy'] += 1
                except Exception as e:
                    print(f"Error parsing date: {e}")
        
        # Create line chart for monthly trends
        months = list(monthly_data.keys())
        water_counts = [monthly_data[m]['water'] for m in months]
        energy_counts = [monthly_data[m]['energy'] for m in months]
        
        plt.figure(figsize=(12, 6))
        plt.plot(months, water_counts, marker='o', linewidth=2, label='Water')
        plt.plot(months, energy_counts, marker='s', linewidth=2, label='Energy')
        plt.xlabel('Month')
        plt.ylabel('Number of Complaints')
        plt.title('Monthly Complaint Trends')
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.legend()
        
        # Save to bytes
        trends_img = io.BytesIO()
        plt.savefig(trends_img, format='png')
        trends_img.seek(0)
        trends_chart = base64.b64encode(trends_img.getvalue()).decode('utf-8')
        plt.close()
        
        # 4. Resolution Time Analysis
        resolution_data = {'water': {'high': 0, 'medium': 0, 'low': 0}, 
                           'energy': {'high': 0, 'medium': 0, 'low': 0}}
        
        for complaint in complaints:
            category = complaint.get('category')
            priority = complaint.get('priority')
            date_str = complaint.get('date')
            resolved_date_str = complaint.get('resolved_date')
            
            if category and priority and date_str and resolved_date_str:
                try:
                    date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    resolved_date = datetime.fromisoformat(resolved_date_str.replace('Z', '+00:00'))
                    days = (resolved_date - date).days
                    
                    if category in resolution_data and priority in resolution_data[category]:
                        # Add to count and total days
                        resolution_data[category][priority] += days
                except Exception as e:
                    print(f"Error calculating resolution time: {e}")
        
        # Create bar chart for resolution time
        categories = list(resolution_data.keys())
        high_times = [resolution_data[c]['high'] for c in categories]
        medium_times = [resolution_data[c]['medium'] for c in categories]
        low_times = [resolution_data[c]['low'] for c in categories]
        
        x = np.arange(len(categories))
        width = 0.25
        
        plt.figure(figsize=(12, 6))
        plt.bar(x - width, high_times, width, label='High Priority', color='#ef4444')
        plt.bar(x, medium_times, width, label='Medium Priority', color='#3b82f6')
        plt.bar(x + width, low_times, width, label='Low Priority', color='#22c55e')
        
        plt.xlabel('Category')
        plt.ylabel('Days to Resolution')
        plt.title('Average Resolution Time by Category and Priority')
        plt.xticks(x, categories)
        plt.legend()
        plt.grid(True, linestyle='--', alpha=0.7, axis='y')
        
        # Save to bytes
        resolution_img = io.BytesIO()
        plt.savefig(resolution_img, format='png')
        resolution_img.seek(0)
        resolution_chart = base64.b64encode(resolution_img.getvalue()).decode('utf-8')
        plt.close()
        
        return jsonify({
            "categoryChart": f"data:image/png;base64,{category_chart}",
            "priorityChart": f"data:image/png;base64,{priority_chart}",
            "trendsChart": f"data:image/png;base64,{trends_chart}",
            "resolutionChart": f"data:image/png;base64,{resolution_chart}"
        })
    
    except Exception as e:
        print(f"Error generating analytics: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
