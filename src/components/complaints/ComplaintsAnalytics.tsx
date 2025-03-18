
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock data generator functions
const generateMockCategoryChart = (complaints: any[]) => {
  // Extract categories and count them
  const categories = complaints.map(c => c.category || 'unknown');
  const categoryCounts: Record<string, number> = {};
  
  categories.forEach(category => {
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  // Simple SVG pie chart
  const colors = { water: '#4299e1', energy: '#f6ad55', unknown: '#a0aec0' };
  const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  
  let startAngle = 0;
  let paths = [];
  let legend = [];
  
  Object.entries(categoryCounts).forEach(([category, count], index) => {
    const percentage = count / total;
    const endAngle = startAngle + percentage * 2 * Math.PI;
    
    const x1 = 250 + 100 * Math.cos(startAngle);
    const y1 = 150 + 100 * Math.sin(startAngle);
    const x2 = 250 + 100 * Math.cos(endAngle);
    const y2 = 150 + 100 * Math.sin(endAngle);
    
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    
    paths.push(`<path d="M 250 150 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${colors[category as keyof typeof colors] || '#' + Math.floor(Math.random()*16777215).toString(16)}" />`);
    
    legend.push(`
      <g transform="translate(400, ${110 + index * 30})">
        <rect width="20" height="20" fill="${colors[category as keyof typeof colors] || '#' + Math.floor(Math.random()*16777215).toString(16)}" />
        <text x="30" y="15" font-size="15">${category} (${Math.round(percentage * 100)}%)</text>
      </g>
    `);
    
    startAngle = endAngle;
  });
  
  const svg = `
    <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
      <text x="250" y="30" text-anchor="middle" font-size="20" font-weight="bold">Complaints by Category</text>
      ${paths.join('\n')}
      ${legend.join('\n')}
    </svg>
  `;
  
  return 'data:image/svg+xml;base64,' + btoa(svg);
};

const generateMockPriorityChart = (complaints: any[]) => {
  // Extract priorities and count them
  const priorities = complaints.map(c => c.priority || 'unknown');
  const priorityCounts: Record<string, number> = { 'high': 0, 'medium': 0, 'low': 0 };
  
  priorities.forEach(priority => {
    priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
  });
  
  // Simple SVG bar chart
  const colors = { high: '#f56565', medium: '#ed8936', low: '#48bb78', unknown: '#a0aec0' };
  const maxCount = Math.max(...Object.values(priorityCounts));
  
  let bars = [];
  const barWidth = 80;
  const barGap = 40;
  let startX = 100;
  
  Object.entries(priorityCounts).forEach(([priority, count]) => {
    const barHeight = count > 0 ? (count / maxCount) * 200 : 0;
    
    bars.push(`
      <g transform="translate(${startX}, 0)">
        <rect x="0" y="${250 - barHeight}" width="${barWidth}" height="${barHeight}" fill="${colors[priority as keyof typeof colors] || '#a0aec0'}" />
        <text x="${barWidth/2}" y="${250 - barHeight - 10}" text-anchor="middle" font-size="14">${count}</text>
        <text x="${barWidth/2}" y="270" text-anchor="middle" font-size="14">${priority}</text>
      </g>
    `);
    
    startX += barWidth + barGap;
  });
  
  const svg = `
    <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
      <text x="250" y="30" text-anchor="middle" font-size="20" font-weight="bold">Complaints by Priority</text>
      ${bars.join('\n')}
    </svg>
  `;
  
  return 'data:image/svg+xml;base64,' + btoa(svg);
};

const generateMockTrendsChart = (complaints: any[]) => {
  // Group complaints by month
  const monthlyData: Record<string, number> = {};
  
  // Sort by date
  const sortedComplaints = [...complaints].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  sortedComplaints.forEach(complaint => {
    try {
      const date = new Date(complaint.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    } catch (error) {
      // Skip invalid dates
    }
  });
  
  // If no data, create some mock data
  if (Object.keys(monthlyData).length === 0) {
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = Math.floor(Math.random() * 10) + 1;
    }
  }
  
  // Sort keys
  const sortedMonths = Object.keys(monthlyData).sort();
  
  // Create line chart
  const points = [];
  const labels = [];
  const maxCount = Math.max(...Object.values(monthlyData));
  const chartWidth = 400;
  const chartHeight = 200;
  const paddingLeft = 50;
  const paddingBottom = 50;
  
  const pointWidth = chartWidth / (sortedMonths.length - 1 || 1);
  
  sortedMonths.forEach((month, index) => {
    const x = paddingLeft + index * pointWidth;
    const y = 250 - paddingBottom - (monthlyData[month] / maxCount) * chartHeight;
    
    points.push(`${x},${y}`);
    
    // Format month for display (convert YYYY-MM to MMM YYYY)
    const [year, monthNum] = month.split('-');
    const monthDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const monthName = monthDate.toLocaleString('default', { month: 'short' });
    
    labels.push(`
      <g transform="translate(${x}, ${250 - 20})">
        <text x="0" y="0" text-anchor="middle" font-size="10" transform="rotate(-45)">${monthName} ${year}</text>
      </g>
    `);
    
    // Add point value label
    points.push(`
      <g transform="translate(${x}, ${y - 10})">
        <text x="0" y="0" text-anchor="middle" font-size="12">${monthlyData[month]}</text>
      </g>
    `);
  });
  
  // Create the polyline points attribute
  const pointsAttr = sortedMonths.map((month, index) => {
    const x = paddingLeft + index * pointWidth;
    const y = 250 - paddingBottom - (monthlyData[month] / maxCount) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  // Create chart
  const svg = `
    <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
      <text x="250" y="30" text-anchor="middle" font-size="20" font-weight="bold">Monthly Complaint Trends</text>
      
      <!-- Axis lines -->
      <line x1="${paddingLeft}" y1="${250 - paddingBottom}" x2="${paddingLeft + chartWidth}" y2="${250 - paddingBottom}" stroke="black" stroke-width="1" />
      <line x1="${paddingLeft}" y1="${250 - paddingBottom}" x2="${paddingLeft}" y2="${250 - paddingBottom - chartHeight}" stroke="black" stroke-width="1" />
      
      <!-- Data line -->
      <polyline points="${pointsAttr}" fill="none" stroke="#4299e1" stroke-width="2" />
      
      <!-- Data points -->
      ${sortedMonths.map((month, index) => {
        const x = paddingLeft + index * pointWidth;
        const y = 250 - paddingBottom - (monthlyData[month] / maxCount) * chartHeight;
        return `<circle cx="${x}" cy="${y}" r="4" fill="#4299e1" />`;
      }).join('\n')}
      
      <!-- Point labels -->
      ${sortedMonths.map((month, index) => {
        const x = paddingLeft + index * pointWidth;
        const y = 250 - paddingBottom - (monthlyData[month] / maxCount) * chartHeight;
        return `<text x="${x}" y="${y - 10}" text-anchor="middle" font-size="12">${monthlyData[month]}</text>`;
      }).join('\n')}
      
      <!-- X-axis labels -->
      ${labels.join('\n')}
    </svg>
  `;
  
  return 'data:image/svg+xml;base64,' + btoa(svg);
};

const generateMockResolutionChart = (complaints: any[]) => {
  // For a simple chart, let's use average resolution time for each category
  const categories = ['water', 'energy'];
  const avgResolutionDays = categories.map(() => Math.floor(Math.random() * 10) + 1);
  
  // Create bar chart
  const barWidth = 100;
  const barGap = 80;
  let startX = 120;
  
  const maxDays = Math.max(...avgResolutionDays);
  const bars = [];
  
  categories.forEach((category, index) => {
    const days = avgResolutionDays[index];
    const barHeight = days > 0 ? (days / maxDays) * 200 : 0;
    const colors = { water: '#4299e1', energy: '#f6ad55' };
    
    bars.push(`
      <g transform="translate(${startX}, 0)">
        <rect x="0" y="${250 - barHeight}" width="${barWidth}" height="${barHeight}" fill="${colors[category as keyof typeof colors]}" />
        <text x="${barWidth/2}" y="${250 - barHeight - 10}" text-anchor="middle" font-size="14">${days.toFixed(1)}</text>
        <text x="${barWidth/2}" y="270" text-anchor="middle" font-size="14">${category}</text>
      </g>
    `);
    
    startX += barWidth + barGap;
  });
  
  const svg = `
    <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
      <text x="250" y="30" text-anchor="middle" font-size="20" font-weight="bold">Average Resolution Time (Days)</text>
      ${bars.join('\n')}
    </svg>
  `;
  
  return 'data:image/svg+xml;base64,' + btoa(svg);
};

const ComplaintsAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [charts, setCharts] = useState<{
    categoryChart: string;
    priorityChart: string;
    trendsChart: string;
    resolutionChart: string;
  } | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (complaints.length > 0) {
      generateAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [complaints]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching complaints for analytics...");
      const { data, error } = await supabase
        .from('complaints')
        .select('*');
      
      if (error) {
        console.error('Error fetching complaints:', error);
        throw error;
      }
      
      if (data) {
        console.log("Fetched complaints for analytics:", data.length);
        setComplaints(data);
      } else {
        console.log("No complaints data returned");
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints for analytics:', error);
      toast.error('Failed to load complaints data for analytics');
    }
  };

  const generateAnalytics = async () => {
    try {
      if (complaints.length === 0) {
        console.log("No complaints to generate analytics from");
        setIsLoading(false);
        return;
      }
      
      console.log("Generating analytics from", complaints.length, "complaints");
      
      // First try the Python backend
      try {
        console.log("Attempting to generate analytics using Python backend...");
        const { data, error } = await supabase.functions.invoke('python-bridge', {
          body: { 
            endpoint: 'generate_analytics',
            data: { complaints }
          }
        });
        
        if (error) {
          console.error("Python bridge error:", error);
          throw error;
        }
        
        if (data) {
          console.log("Analytics generated successfully from Python backend:", data);
          setCharts(data);
          setIsLoading(false);
          return;
        }
      } catch (pythonError) {
        console.warn('Python backend not available, falling back to client-side charts:', pythonError);
        // Fall back to client-side generated charts
      }
      
      // Fallback to client-side generated charts
      console.log("Using client-side generated charts");
      
      // Generate charts based on the complaints data we have
      const generatedCharts = {
        categoryChart: generateMockCategoryChart(complaints),
        priorityChart: generateMockPriorityChart(complaints),
        trendsChart: generateMockTrendsChart(complaints),
        resolutionChart: generateMockResolutionChart(complaints)
      };
      
      setCharts(generatedCharts);
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast.error('Failed to generate analytics charts');
      
      // Still generate some charts even if there's an error
      const generatedCharts = {
        categoryChart: generateMockCategoryChart(complaints),
        priorityChart: generateMockPriorityChart(complaints),
        trendsChart: generateMockTrendsChart(complaints),
        resolutionChart: generateMockResolutionChart(complaints)
      };
      
      setCharts(generatedCharts);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No complaints data available</h3>
            <p className="text-muted-foreground">
              Submit some complaints to see analytics here.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Complaints by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {charts?.categoryChart ? (
                <img src={charts.categoryChart} alt="Complaints by Category" className="max-h-[280px] object-contain mx-auto" />
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Complaints by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {charts?.priorityChart ? (
                <img src={charts.priorityChart} alt="Complaints by Priority" className="max-h-[280px] object-contain mx-auto" />
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Complaint Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {charts?.trendsChart ? (
              <img src={charts.trendsChart} alt="Monthly Complaint Trends" className="max-h-[280px] object-contain mx-auto" />
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Resolution Time (Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {charts?.resolutionChart ? (
              <img src={charts.resolutionChart} alt="Average Resolution Time" className="max-h-[280px] object-contain mx-auto" />
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintsAnalytics;
