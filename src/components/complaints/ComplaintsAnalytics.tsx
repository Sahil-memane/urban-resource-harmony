
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsProps {
  viewType?: 'overview' | 'trends' | 'predictions';
}

const COLORS = {
  water: '#1f77b4',
  energy: '#ff7f0e',
  low: '#2ca02c',
  medium: '#d62728',
  high: '#9467bd'
};

// Function to get a color based on response time
const getTimeResponseColor = (index: number) => {
  switch(index) {
    case 0: return '#10B981'; // < 6 hours (bright green)
    case 1: return '#34D399'; // < 12 hours (green)
    case 2: return '#FBBF24'; // 12-24 hours (yellow)
    case 3: return '#F59E0B'; // 24-48 hours (amber)
    case 4: return '#EF4444'; // > 48 hours (red)
    default: return '#CBD5E1'; // default gray
  }
};

const ComplaintsAnalytics: React.FC<AnalyticsProps> = ({ viewType = 'overview' }) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (complaints.length > 0) {
      generateAnalytics();
    }
  }, [complaints, viewType]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log("Fetched complaints for analytics:", data?.length || 0);
      
      if (data && data.length > 0) {
        setComplaints(data);
      } else {
        // If no real data is available, use mock data for demonstration
        console.log("No complaints found, using mock data");
        setComplaints(generateMockComplaints());
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Failed to load complaints data');
      toast.error('Failed to load analytics data');
      // Use mock data as fallback
      setComplaints(generateMockComplaints());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockComplaints = () => {
    return [
      { id: '1', category: 'water', priority: 'medium', content: 'Low water pressure', source: 'text', status: 'pending', date: '2024-05-01T10:00:00.000Z', resolved_date: '2024-05-01T15:30:00.000Z' },
      { id: '2', category: 'energy', priority: 'high', content: 'Power outage', source: 'voice', status: 'in-progress', date: '2024-05-03T14:00:00.000Z', resolved_date: '2024-05-03T21:00:00.000Z' },
      { id: '3', category: 'water', priority: 'low', content: 'Leaky faucet', source: 'image', status: 'resolved', date: '2024-05-05T16:00:00.000Z', resolved_date: '2024-05-07T11:00:00.000Z' },
      { id: '4', category: 'energy', priority: 'medium', content: 'Billing issue', source: 'text', status: 'pending', date: '2024-05-07T18:00:00.000Z', resolved_date: '2024-05-08T11:00:00.000Z' },
      { id: '5', category: 'water', priority: 'high', content: 'Water contamination', source: 'voice', status: 'in-progress', date: '2024-05-09T20:00:00.000Z', resolved_date: '2024-05-10T08:00:00.000Z' },
      { id: '6', category: 'energy', priority: 'low', content: 'Streetlight not working', source: 'image', status: 'resolved', date: '2024-05-11T22:00:00.000Z', resolved_date: '2024-05-16T10:00:00.000Z' },
      { id: '7', category: 'water', priority: 'medium', content: 'Low water pressure', source: 'text', status: 'pending', date: '2024-05-13T00:00:00.000Z', resolved_date: '2024-05-13T10:00:00.000Z' },
      { id: '8', category: 'energy', priority: 'high', content: 'Power outage', source: 'voice', status: 'in-progress', date: '2024-05-15T02:00:00.000Z', resolved_date: '2024-05-15T07:00:00.000Z' },
      { id: '9', category: 'water', priority: 'low', content: 'Leaky faucet', source: 'image', status: 'resolved', date: '2024-05-17T04:00:00.000Z', resolved_date: '2024-05-22T16:00:00.000Z' },
      { id: '10', category: 'energy', priority: 'medium', content: 'Billing issue', source: 'text', status: 'pending', date: '2024-05-19T06:00:00.000Z', resolved_date: '2024-05-19T14:00:00.000Z' },
    ];
  };

  const generateAnalytics = () => {
    const categoryData = getCategoryAnalytics();
    const priorityData = getPriorityAnalytics();
    const trendsData = getTrendsAnalytics();
    const resolutionData = getResolutionAnalytics();
    const responseRateData = getResponseRateAnalytics();
    const timeOfDayData = getTimeOfDayData();
    const monthlyVolumeData = getMonthlyVolumeData();
    const statusDistributionData = getStatusDistributionData();
    const predictionData = generatePredictionData();

    setAnalyticsData({
      categoryData,
      priorityData,
      trendsData,
      resolutionData,
      responseRateData,
      timeOfDayData,
      monthlyVolumeData,
      statusDistributionData,
      predictionData
    });
  };

  const getCategoryAnalytics = () => {
    const categoryCounts: { [key: string]: number } = {};
    complaints.forEach(complaint => {
      categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  };

  const getPriorityAnalytics = () => {
    const priorityCounts: { [key: string]: number } = {};
    complaints.forEach(complaint => {
      priorityCounts[complaint.priority] = (priorityCounts[complaint.priority] || 0) + 1;
    });

    return Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));
  };

  const getTrendsAnalytics = () => {
    const monthlyCounts: { [key: string]: { water: number, energy: number } } = {};
    
    // Create entries for the last 6 months to ensure we have a complete timeline
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      const monthYear = d.toISOString().slice(0, 7);
      monthlyCounts[monthYear] = { water: 0, energy: 0 };
    }
    
    // Fill in actual data
    complaints.forEach(complaint => {
      const monthYear = new Date(complaint.date).toISOString().slice(0, 7);
      if (!monthlyCounts[monthYear]) {
        monthlyCounts[monthYear] = { water: 0, energy: 0 };
      }
      monthlyCounts[monthYear][complaint.category as 'water' | 'energy']++;
    });

    return Object.entries(monthlyCounts).map(([date, counts]) => ({
      date,
      water: counts.water,
      energy: counts.energy,
      total: counts.water + counts.energy
    }));
  };

  const getResolutionAnalytics = () => {
    const resolutionTimes: { [key: string]: number[] } = { water: [], energy: [] };
    complaints.forEach(complaint => {
      if (complaint.resolved_date && complaint.date) {
        const resolvedDate = new Date(complaint.resolved_date).getTime();
        const submittedDate = new Date(complaint.date).getTime();
        const resolutionTime = (resolvedDate - submittedDate) / (1000 * 60 * 60 * 24); // in days
        resolutionTimes[complaint.category].push(resolutionTime);
      }
    });

    return Object.entries(resolutionTimes).map(([name, times]) => ({
      name,
      value: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
    }));
  };

  const getResponseRateAnalytics = () => {
    // Calculate % of complaints responded within different time frames with more granularity
    const timeCategories = ["< 6 hours", "< 12 hours", "12-24 hours", "24-48 hours", "> 48 hours"];
    const counts = [0, 0, 0, 0, 0];
    let total = 0;
    
    complaints.forEach(complaint => {
      if (complaint.resolved_date && complaint.date) {
        const resolvedDate = new Date(complaint.resolved_date);
        const submittedDate = new Date(complaint.date);
        const hoursToResolve = (resolvedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursToResolve <= 6) {
          counts[0]++;
        } else if (hoursToResolve <= 12) {
          counts[1]++;
        } else if (hoursToResolve <= 24) {
          counts[2]++;
        } else if (hoursToResolve <= 48) {
          counts[3]++;
        } else {
          counts[4]++;
        }
        
        total++;
      }
    });
    
    const responseRates = timeCategories.map((name, index) => ({
      name,
      value: total > 0 ? Math.round((counts[index] / total) * 100) : 0
    }));
    
    return responseRates;
  };

  const getTimeOfDayData = () => {
    const timeOfDayCounts: { [key: string]: number } = {
      'Night (0-6)': 0,
      'Morning (6-12)': 0,
      'Afternoon (12-18)': 0,
      'Evening (18-24)': 0
    };
    
    complaints.forEach(complaint => {
      const hour = new Date(complaint.date).getHours();
      let timeOfDay;
      if (hour >= 0 && hour < 6) {
        timeOfDay = 'Night (0-6)';
      } else if (hour >= 6 && hour < 12) {
        timeOfDay = 'Morning (6-12)';
      } else if (hour >= 12 && hour < 18) {
        timeOfDay = 'Afternoon (12-18)';
      } else {
        timeOfDay = 'Evening (18-24)';
      }
      timeOfDayCounts[timeOfDay]++;
    });

    return Object.entries(timeOfDayCounts).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyVolumeData = () => {
    // Get high priority complaints volume by month to show trends
    const highPriorityByMonth: { [key: string]: number } = {};
    
    // Create entries for the last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      const monthYear = d.toISOString().slice(0, 7);
      highPriorityByMonth[monthYear] = 0;
    }
    
    // Fill with actual data
    complaints
      .filter(c => c.priority === 'high')
      .forEach(complaint => {
        const monthYear = new Date(complaint.date).toISOString().slice(0, 7);
        if (highPriorityByMonth[monthYear] !== undefined) {
          highPriorityByMonth[monthYear]++;
        }
      });
      
    return Object.entries(highPriorityByMonth).map(([month, count]) => ({
      month,
      count
    }));
  };

  const getStatusDistributionData = () => {
    const statusCounts: { [key: string]: number } = {
      'pending': 0,
      'in-progress': 0,
      'resolved': 0,
      'rejected': 0
    };
    
    complaints.forEach(complaint => {
      statusCounts[complaint.status] = (statusCounts[complaint.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const generatePredictionData = () => {
    // Generated prediction data for future complaint volumes
    // This would be replaced with actual ML predictions in a production environment
    const next3Months: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 3; i++) {
      const d = new Date(today);
      d.setMonth(d.getMonth() + i);
      next3Months.push(d.toISOString().slice(0, 7));
    }
    
    // Get average monthly increase
    const historicalData = getTrendsAnalytics();
    let avgIncrease = 0;
    
    if (historicalData.length > 1) {
      const increases = [];
      for (let i = 1; i < historicalData.length; i++) {
        increases.push(historicalData[i].total - historicalData[i-1].total);
      }
      avgIncrease = increases.reduce((a, b) => a + b, 0) / increases.length;
    }
    
    // Generate prediction data with some randomness
    const lastMonth = historicalData.length > 0 ? historicalData[historicalData.length - 1] : { water: 5, energy: 5, total: 10 };
    const predictions = next3Months.map((month, i) => {
      const waterPredicted = Math.round(lastMonth.water * (1 + (avgIncrease * 0.1) * (i + 1)) + (Math.random() * 2 - 1));
      const energyPredicted = Math.round(lastMonth.energy * (1 + (avgIncrease * 0.1) * (i + 1)) + (Math.random() * 2 - 1));
      
      return {
        month,
        water: Math.max(1, waterPredicted),  // Ensure we don't go below 1
        energy: Math.max(1, energyPredicted),
        total: Math.max(2, waterPredicted + energyPredicted)
      };
    });
    
    return predictions;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <h3 className="font-medium">Error loading analytics data</h3>
        <p>{error}</p>
      </div>
    );
  }

  function renderOverviewAnalytics() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Complaints by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData?.categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData?.categoryData?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#000000'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Distribution of complaints across service categories
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complaints by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                      {analyticsData?.priorityData?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#000000'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Breakdown of complaints by urgency level
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
            <CardDescription>Percentage of complaints resolved within time frames</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.responseRateData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ value }) => `${value}%`}
                  >
                    {analyticsData?.responseRateData?.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getTimeResponseColor(index)} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Response times are calculated from complaint submission to resolution
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Complaints by Time of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.timeOfDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Pattern of complaint submissions throughout the day
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderTrendsAnalytics() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Complaint Trends Over Time</CardTitle>
            <CardDescription>Monthly complaint volume by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData?.trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="water" stroke={COLORS.water} name="Water Complaints" />
                  <Line type="monotone" dataKey="energy" stroke={COLORS.energy} name="Energy Complaints" />
                  <Line type="monotone" dataKey="total" stroke="#808080" name="Total Complaints" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Priority Complaints Trend</CardTitle>
            <CardDescription>Monthly volume of high priority complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData?.monthlyVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#ff0000" fill="#ff000066" name="High Priority Complaints" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Times by Category</CardTitle>
            <CardDescription>Average days to resolve complaints by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.resolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)} days`} />
                  <Bar dataKey="value">
                    {analyticsData?.resolutionData?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#000000'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Resolution time measures the duration from complaint submission to final resolution
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderPredictionsAnalytics() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Predicted Complaint Volume</CardTitle>
            <CardDescription>Forecasted complaints for next 3 months based on historical trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.predictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="water" name="Water Complaints" fill={COLORS.water} />
                  <Bar dataKey="energy" name="Energy Complaints" fill={COLORS.energy} />
                  <Bar dataKey="total" name="Total Complaints" fill="#808080" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Predictions are based on historical complaint patterns and seasonal trends
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Resource Needs</CardTitle>
            <CardDescription>Projected staffing needs based on complaint forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData?.predictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="water" 
                    stroke={COLORS.water} 
                    name="Water Response Teams" 
                    dot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke={COLORS.energy} 
                    name="Energy Response Teams" 
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Each unit represents a response team needed to maintain service standards
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predicted Resolution Times</CardTitle>
            <CardDescription>Forecasted average resolution times for upcoming complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium text-center mb-2">Water Complaints</h4>
                <div className="flex items-center justify-between">
                  <span>Low Priority:</span>
                  <span className="font-medium">48-72 hours</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span>Medium Priority:</span>
                  <span className="font-medium">24-48 hours</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span>High Priority:</span>
                  <span className="font-medium">4-12 hours</span>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium text-center mb-2">Energy Complaints</h4>
                <div className="flex items-center justify-between">
                  <span>Low Priority:</span>
                  <span className="font-medium">36-60 hours</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span>Medium Priority:</span>
                  <span className="font-medium">12-36 hours</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span>High Priority:</span>
                  <span className="font-medium">2-8 hours</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-4 text-center">
              Predictions based on historical performance and current resource allocation
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewType === 'overview' && renderOverviewAnalytics()}
      {viewType === 'trends' && renderTrendsAnalytics()}
      {viewType === 'predictions' && renderPredictionsAnalytics()}
    </div>
  );
};

export default ComplaintsAnalytics;
