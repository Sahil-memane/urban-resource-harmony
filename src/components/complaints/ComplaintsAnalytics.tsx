import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const COLORS = {
  water: '#4299E1',  // Blue
  energy: '#F6AD55', // Orange
  high: '#EF4444',   // Red
  medium: '#F59E0B', // Amber
  low: '#34D399',    // Green
  success: '#10B981', // Green
  warning: '#FBBF24', // Yellow
  danger: '#DC2626',  // Red
  residential: '#8884d8', // Purple
  industrial: '#82ca9d', // Green
  commercial: '#ffc658', // Yellow
  domestic: '#8dd1e1', // Light blue
  others: '#a4de6c', // Light green
  primary: '#6366f1', // Primary app color
  secondary: '#ec4899', // Secondary app color
};

type AnalyticsProps = {
  viewType?: 'overview' | 'trends' | 'predictions';
};

// Helper component for ComposedChart - renamed to CustomComposedChart to avoid conflicts
const CustomComposedChart = (props: any) => {
  const { data, children, ...rest } = props;
  return (
    <LineChart data={data} {...rest}>
      {children}
    </LineChart>
  );
};

const ComplaintsAnalytics: React.FC<AnalyticsProps> = ({ viewType = 'overview' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const { userRole } = useUserRole();

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (complaints.length > 0) {
      generateAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [complaints, viewType]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching complaints for analytics...");
      
      let query = supabase.from('complaints').select('*');
      
      // Filter by category based on admin role
      if (userRole === 'water-admin') {
        query = query.eq('category', 'water');
      } else if (userRole === 'energy-admin') {
        query = query.eq('category', 'energy');
      }
      
      const { data, error } = await query;
      
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
            data: { 
              complaints,
              userRole,
              viewType
            }
          }
        });
        
        if (error) {
          console.error("Python bridge error:", error);
          throw error;
        }
        
        if (data) {
          console.log("Analytics generated successfully from Python backend:", data);
          setAnalyticsData(data);
          setIsLoading(false);
          return;
        }
      } catch (pythonError) {
        console.warn('Python backend not available, falling back to client-side charts:', pythonError);
      }
      
      console.log("Using client-side generated charts");
      
      // Generate client-side analytics based on viewType
      let analyticsOutput = {};
      
      if (viewType === 'overview') {
        analyticsOutput = generateOverviewAnalytics();
      } else if (viewType === 'trends') {
        analyticsOutput = generateTrendsAnalytics();
      } else if (viewType === 'predictions') {
        analyticsOutput = generatePredictionsAnalytics();
      }
      
      setAnalyticsData(analyticsOutput);
      
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast.error('Failed to generate analytics charts');
      
      // Still generate some basic charts even if there's an error
      setAnalyticsData(generateOverviewAnalytics());
    } finally {
      setIsLoading(false);
    }
  };

  const generateOverviewAnalytics = () => {
    const categoryData = getCategoryAnalytics();
    const priorityData = getPriorityAnalytics();
    const trendsData = getTrendsAnalytics();
    const resolutionData = getResolutionAnalytics();
    
    // For specific admin roles, add specialized analytics
    const responseRateData = getResponseRateAnalytics(); 
    const timeOfDayData = getTimeOfDayAnalytics();
    const satisfactionScores = getSatisfactionScores();
    
    return {
      categoryData,
      priorityData,
      trendsData,
      resolutionData,
      responseRateData,
      timeOfDayData,
      satisfactionScores
    };
  };

  const generateTrendsAnalytics = () => {
    const monthlyTrends = getTrendsAnalytics();
    const areaComparison = getAreaComparisonAnalytics();
    const seasonalTrends = getSeasonalTrendsAnalytics();
    const recurringIssues = getRecurringIssuesAnalytics();
    
    return {
      monthlyTrends,
      areaComparison,
      seasonalTrends,
      recurringIssues
    };
  };

  const generatePredictionsAnalytics = () => {
    // Since we can't actually do ML predictions client-side,
    // we'll generate simulated prediction data
    const expectedVolume = getExpectedVolumeAnalytics();
    const resolutionPredictions = getResolutionPredictions();
    const resourceAllocation = getResourceAllocationAnalytics();
    
    return {
      expectedVolume,
      resolutionPredictions,
      resourceAllocation
    };
  };

  const getCategoryAnalytics = () => {
    const categoryCounts: { [key: string]: number } = {};
    complaints.forEach(complaint => {
      categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getPriorityAnalytics = () => {
    const priorityCounts: { [key: string]: number } = {
      high: 0,
      medium: 0,
      low: 0
    };
    complaints.forEach(complaint => {
      priorityCounts[complaint.priority] = (priorityCounts[complaint.priority] || 0) + 1;
    });
    
    return Object.entries(priorityCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getTrendsAnalytics = () => {
    const monthlyData: { [key: string]: { total: number, water: number, energy: number } } = {};
    
    // Sort complaints by date
    const sortedComplaints = [...complaints].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    sortedComplaints.forEach(complaint => {
      const date = new Date(complaint.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, water: 0, energy: 0 };
      }
      
      monthlyData[monthKey].total++;
      monthlyData[monthKey][complaint.category]++;
    });
    
    return Object.entries(monthlyData).map(([date, data]) => ({
      date,
      total: data.total,
      water: data.water,
      energy: data.energy
    }));
  };

  const getResolutionAnalytics = () => {
    const categoryResolutionTimes: { [key: string]: number[] } = {
      water: [],
      energy: []
    };
    
    complaints.forEach(complaint => {
      if (complaint.resolved_date && complaint.date) {
        const resolvedDate = new Date(complaint.resolved_date);
        const submittedDate = new Date(complaint.date);
        const daysToResolve = (resolvedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        categoryResolutionTimes[complaint.category].push(daysToResolve);
      }
    });
    
    return Object.entries(categoryResolutionTimes).map(([category, times]) => ({
      name: category,
      value: times.length > 0 ? times.reduce((a, b) => a + b) / times.length : 0
    }));
  };

  // New specialized analytics functions for different admin types
  const getResponseRateAnalytics = () => {
    // Calculate % of complaints responded within 24 hours
    const responseRates: { name: string, value: number }[] = [];
    const timeCategories = ["< 24 hours", "24-48 hours", "> 48 hours"];
    const counts = [0, 0, 0];
    let total = 0;
    
    complaints.forEach(complaint => {
      if (complaint.resolved_date && complaint.date) {
        const resolvedDate = new Date(complaint.resolved_date);
        const submittedDate = new Date(complaint.date);
        const hoursToResolve = (resolvedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursToResolve <= 24) {
          counts[0]++;
        } else if (hoursToResolve <= 48) {
          counts[1]++;
        } else {
          counts[2]++;
        }
        
        total++;
      }
    });
    
    // Convert to percentages
    if (total > 0) {
      timeCategories.forEach((name, index) => {
        responseRates.push({
          name,
          value: Math.round((counts[index] / total) * 100)
        });
      });
    }
    
    return responseRates;
  };

  const getTimeOfDayAnalytics = () => {
    // Time of day complaint distribution (morning, afternoon, evening, night)
    const timeSlots = {
      "Morning (6-12)": 0,
      "Afternoon (12-18)": 0,
      "Evening (18-24)": 0,
      "Night (0-6)": 0
    };
    
    complaints.forEach(complaint => {
      const date = new Date(complaint.date);
      const hour = date.getHours();
      
      if (hour >= 6 && hour < 12) {
        timeSlots["Morning (6-12)"]++;
      } else if (hour >= 12 && hour < 18) {
        timeSlots["Afternoon (12-18)"]++;
      } else if (hour >= 18 && hour < 24) {
        timeSlots["Evening (18-24)"]++;
      } else {
        timeSlots["Night (0-6)"]++;
      }
    });
    
    return Object.entries(timeSlots).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getSatisfactionScores = () => {
    // For now, generate mock satisfaction scores
    // In a real app, you'd use actual feedback data
    return [
      { name: "Very satisfied", value: Math.floor(Math.random() * 30) + 20 },
      { name: "Satisfied", value: Math.floor(Math.random() * 30) + 30 },
      { name: "Neutral", value: Math.floor(Math.random() * 20) + 10 },
      { name: "Unsatisfied", value: Math.floor(Math.random() * 10) + 5 },
      { name: "Very unsatisfied", value: Math.floor(Math.random() * 5) + 1 }
    ];
  };
  
  // For trends tab
  const getAreaComparisonAnalytics = () => {
    // Mock data for different areas (would be based on actual locational data)
    const areas = ["North Zone", "South Zone", "East Zone", "West Zone", "Central"];
    
    if (userRole === 'water-admin') {
      return areas.map(area => ({
        name: area,
        leakage: Math.floor(Math.random() * 30) + 5,
        shortage: Math.floor(Math.random() * 20) + 3,
        quality: Math.floor(Math.random() * 15) + 2,
      }));
    } else if (userRole === 'energy-admin') {
      return areas.map(area => ({
        name: area,
        outages: Math.floor(Math.random() * 25) + 5,
        voltage: Math.floor(Math.random() * 18) + 3,
        billing: Math.floor(Math.random() * 12) + 2,
      }));
    } else {
      // Super admin or other roles
      return areas.map(area => ({
        name: area,
        water: Math.floor(Math.random() * 40) + 10,
        energy: Math.floor(Math.random() * 35) + 10,
      }));
    }
  };

  const getSeasonalTrendsAnalytics = () => {
    // Mock seasonal data
    const seasons = ["Winter", "Spring", "Summer", "Fall"];
    
    if (userRole === 'water-admin') {
      return seasons.map(season => ({
        name: season,
        leakage: Math.floor(Math.random() * 30) + 10,
        flooding: Math.floor(Math.random() * 20) + (season === "Summer" ? 30 : 5),
        quality: Math.floor(Math.random() * 15) + 5,
      }));
    } else if (userRole === 'energy-admin') {
      return seasons.map(season => ({
        name: season,
        outages: Math.floor(Math.random() * 25) + (season === "Summer" || season === "Winter" ? 20 : 5),
        demand: Math.floor(Math.random() * 40) + (season === "Summer" ? 40 : season === "Winter" ? 35 : 15),
        efficiency: Math.floor(Math.random() * 10) + 85, // percentage
      }));
    } else {
      // Super admin
      return seasons.map(season => ({
        name: season,
        water: Math.floor(Math.random() * 50) + 20,
        energy: Math.floor(Math.random() * 60) + 30,
        resolved: Math.floor(Math.random() * 30) + 60, // percentage
      }));
    }
  };

  const getRecurringIssuesAnalytics = () => {
    // Mock recurring issues data
    const issues = userRole === 'water-admin' 
      ? ["Pipe leakage", "Low pressure", "Water quality", "Meter issues", "Water shortage"]
      : userRole === 'energy-admin'
      ? ["Power outage", "Voltage fluctuation", "Billing errors", "Street lights", "Transformer issues"]
      : ["Water issues", "Energy issues", "Infrastructure", "Billing", "Other"];
    
    return issues.map(issue => ({
      name: issue,
      count: Math.floor(Math.random() * 50) + 10,
      recurringRate: Math.floor(Math.random() * 50) + 10, // percentage
    }));
  };
  
  // For predictions tab
  const getExpectedVolumeAnalytics = () => {
    // Mock expected volume for next 6 months
    const today = new Date();
    const data = [];
    
    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      const year = month.getFullYear();
      
      data.push({
        name: `${monthName} ${year}`,
        expected: Math.floor(Math.random() * 40) + 20,
        confidence: Math.floor(Math.random() * 20) + 70, // percentage
      });
    }
    
    return data;
  };

  const getResolutionPredictions = () => {
    // Mock resolution time predictions
    const categories = userRole === 'water-admin'
      ? ["Leakage", "Shortage", "Quality", "Billing", "Infrastructure"]
      : userRole === 'energy-admin'
      ? ["Outages", "Voltage", "Billing", "Street lights", "Transformers"]
      : ["Water", "Energy", "Infrastructure", "Billing", "Other"];
    
    return categories.map(category => ({
      name: category,
      current: Math.floor(Math.random() * 5) + 1, // days
      predicted: Math.floor(Math.random() * 4) + 1, // days
      improvement: Math.floor(Math.random() * 30) + 5, // percentage
    }));
  };

  const getResourceAllocationAnalytics = () => {
    // Mock resource allocation recommendations
    const resources = userRole === 'water-admin'
      ? ["Leak repairs", "Quality testing", "Infrastructure", "Customer service", "Emergency response"]
      : userRole === 'energy-admin'
      ? ["Outage response", "Maintenance", "Grid upgrades", "Customer service", "Smart meters"]
      : ["Water resources", "Energy resources", "Infrastructure", "Customer service", "Administration"];
    
    return resources.map(resource => ({
      name: resource,
      current: Math.floor(Math.random() * 30) + 10, // percentage
      recommended: Math.floor(Math.random() * 30) + 10, // percentage
    }));
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

  // Render different views based on viewType
  if (viewType === 'overview') {
    return renderOverviewAnalytics();
  } else if (viewType === 'trends') {
    return renderTrendsAnalytics();
  } else if (viewType === 'predictions') {
    return renderPredictionsAnalytics();
  }

  // Default to overview if no specific view type
  return renderOverviewAnalytics();

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
                      label
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
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
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
                        fill={index === 0 ? COLORS.success : index === 1 ? COLORS.warning : COLORS.danger} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Resolution Time (Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.resolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {analyticsData?.resolutionData?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#000000'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {userRole !== 'citizen' && (
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
            </CardContent>
          </Card>
        )}
        
        {/* PCMC specific resource allocation data */}
        {userRole !== 'citizen' && analyticsData?.resourceAllocation && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userRole === 'water-admin' 
                  ? 'Water Resource Allocation (%)' 
                  : userRole === 'energy-admin' 
                  ? 'Energy Resource Allocation (%)' 
                  : 'Resource Allocation (%)'}
              </CardTitle>
              <CardDescription>
                Based on PCMC data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData?.resourceAllocation}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ value }) => `${value}%`}
                      labelLine={true}
                    >
                      {analyticsData?.resourceAllocation?.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.name.toLowerCase()] || `hsl(${index * 45}, 70%, 60%)`} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
        
        {userRole === 'citizen' && analyticsData?.citizenRecommendations && (
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Water & Energy Alerts</CardTitle>
              <CardDescription>
                Based on PCMC historical patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Month</th>
                      <th className="p-2 text-left">Alert</th>
                      <th className="p-2 text-left">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData?.citizenRecommendations?.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                        <td className="p-2">{item.month}</td>
                        <td className="p-2">
                          <span 
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.level === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : item.level === 'medium' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {item.alert}
                          </span>
                        </td>
                        <td className="p-2">{item.conservation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  function renderTrendsAnalytics() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Complaint Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData?.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="water" 
                    stackId="1"
                    stroke={COLORS.water} 
                    fill={COLORS.water} 
                    name="Water"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="energy" 
                    stackId="1"
                    stroke={COLORS.energy} 
                    fill={COLORS.energy} 
                    name="Energy"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* PCMC Consumption Trends */}
        {analyticsData?.consumptionTrends && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userRole === 'water-admin' 
                  ? 'PCMC Water Consumption Trends' 
                  : userRole === 'energy-admin' 
                  ? 'PCMC Energy Consumption Trends' 
                  : 'PCMC Resource Consumption Trends'}
              </CardTitle>
              <CardDescription>
                Historical consumption patterns in Pimpri Chinchwad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.consumptionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {userRole === 'water-admin' && (
                      <>
                        <Line type="monotone" dataKey="domestic" stroke="#8884d8" name="Domestic (MLD)" />
                        <Line type="monotone" dataKey="industrial" stroke="#82ca9d" name="Industrial (MLD)" />
                        <Line type="monotone" dataKey="total" stroke="#ff7300" name="Total (MLD)" strokeWidth={2} />
                      </>
                    )}
                    {userRole === 'energy-admin' && (
                      <>
                        <Line type="monotone" dataKey="residential" stroke="#8884d8" name="Residential (MWh)" />
                        <Line type="monotone" dataKey="industrial" stroke="#82ca9d" name="Industrial (MWh)" />
                        <Line type="monotone" dataKey="commercial" stroke="#ffc658" name="Commercial (MWh)" />
                        <Line type="monotone" dataKey="total" stroke="#ff7300" name="Total (MWh)" strokeWidth={2} />
                      </>
                    )}
                    {userRole === 'super-admin' && (
                      <>
                        <Line type="monotone" dataKey="water" stroke={COLORS.water} name="Water Demand (MLD)" />
                        <Line type="monotone" dataKey="energy" stroke={COLORS.energy} name="Energy Demand (MW)" />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seasonal Demand Patterns */}
        {analyticsData?.seasonalDemand && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userRole === 'water-admin' 
                  ? 'Seasonal Water Demand Patterns' 
                  : userRole === 'energy-admin' 
                  ? 'Seasonal Energy Demand Patterns' 
                  : 'Seasonal Resource Demand'}
              </CardTitle>
              <CardDescription>
                Seasonal variations in resource demand based on PCMC data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {userRole === 'water-admin' || userRole === 'energy-admin' ? (
                    <CustomComposedChart data={analyticsData?.seasonalDemand}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {userRole === 'water-admin' && (
                        <>
                          <Bar dataKey="demand" fill="#8884d8" name="Water Demand (MLD)" />
                          <Line type="monotone" dataKey="supply" stroke="#82ca9d" name="Supply Capacity (MLD)" />
                          <Line type="monotone" dataKey="critical" stroke="#ff7300" name="Critical Level (MLD)" strokeDasharray="5 5" />
                        </>
                      )}
                      {userRole === 'energy-admin' && (
                        <>
                          <Bar dataKey="demand" fill="#8884d8" name="Energy Demand (MW)" />
                          <Line type="monotone" dataKey="capacity" stroke="#82ca9d" name="Capacity (MW)" />
                          <Line type="monotone" dataKey="peak" stroke="#ff7300" name="Peak Capacity (MW)" strokeDasharray="5 5" />
                        </>
                      )}
                    </CustomComposedChart>
                  ) : (
                    <RadarChart data={analyticsData?.seasonalDemand}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={90} domain={[0, 150]} />
                      <Radar name="Water (% of average)" dataKey="water" stroke={COLORS.water} fill={COLORS.water} fillOpacity={0.6} />
                      <Radar name="Energy (% of average)" dataKey="energy" stroke={COLORS.energy} fill={COLORS.energy} fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recurring Issues Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Recurring Issues Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.recurringIssues}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Total Complaints" />
                  <Bar yAxisId="right" dataKey="recurringRate" fill="#82ca9d" name="Recurring Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Metrics */}
        {analyticsData?.efficiencyMetrics && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userRole === 'water-admin' 
                  ? 'Water System Efficiency Metrics' 
                  : userRole === 'energy-admin' 
                  ? 'Energy System Efficiency Metrics' 
                  : 'Resource System Efficiency'}
              </CardTitle>
              <CardDescription>
                Analyzing improvement in system efficiency over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.efficiencyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    {userRole === 'water-admin' && (
                      <>
                        <Line type="monotone" dataKey="leakage" stroke="#ff7300" name="Distribution Losses (%)" />
                        <Line type="monotone" dataKey="treatment" stroke="#82ca9d" name="Treatment Efficiency (%)" />
                      </>
                    )}
                    {userRole === 'energy-admin' && (
                      <>
                        <Line type="monotone" dataKey="losses" stroke="#ff7300" name="T&D Losses (%)" />
                        <Line type="monotone" dataKey="renewable" stroke="#82ca9d" name="Renewable Mix (%)" />
                      </>
                    )}
                    {userRole === 'super-admin' && (
                      <>
                        <Line type="monotone" dataKey="water" stroke={COLORS.water} name="Water System Efficiency (%)" />
                        <Line type="monotone" dataKey="energy" stroke={COLORS.energy} name="Energy System Efficiency (%)" />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  function renderPredictionsAnalytics() {
    return (
      <div className="space-y-6">
        {/* Future Resource Demand */}
        {analyticsData?.futureDemand && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userRole === 'water-admin' 
                  ? 'Projected Water Demand' 
                  : userRole === 'energy-admin' 
                  ? 'Projected Energy Demand' 
                  : 'Projected Resource Demand'}
              </CardTitle>
              <CardDescription>
                5-year projection based on PCMC growth patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {userRole === 'water-admin' || userRole === 'energy-admin' ? (
                    <CustomComposedChart data={analyticsData?.futureDemand}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="projected" fill="#8884d8" name="Projected Demand" />
                      <Line type="monotone" dataKey="sustainable" stroke="#82ca9d" name="Sustainable Supply" />
                      <Area dataKey="gap" fill="#ff7300" stroke="#ff7300" name="Supply Gap" />
                    </CustomComposedChart>
                  ) : (
                    <LineChart data={analyticsData?.futureDemand}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="water" stroke={COLORS.water} name="Water Demand (MLD)" />
                      <Line type="monotone" dataKey="energy" stroke={COLORS.energy} name="Energy Demand (MW)" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resource Risk Assessment */}
        {analyticsData?.resourceRisks && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userRole === 'water-admin' 
                  ? 'Water Supply Risk Assessment' 
                  : userRole === 'energy-admin' 
                  ? 'Energy Supply Risk Assessment' 
                  : 'Resource Risk Assessment'}
              </CardTitle>
              <CardDescription>
                Area-wise risk factors based on infrastructure and demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {userRole === 'water-admin' ? (
                    <RadarChart data={analyticsData?.resourceRisks}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="area" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Shortage Risk" dataKey="shortageRisk" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Infrastructure Risk" dataKey="infrastructureRisk" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Radar name="Quality Risk" dataKey="qualityRisk" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  ) : userRole === 'energy-admin' ? (
                    <RadarChart data={analyticsData?.resourceRisks}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="area" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Outage Risk" dataKey="outageRisk" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Capacity Risk" dataKey="capacityRisk" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Radar name="Infrastructure Risk" dataKey="infrastructureRisk" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  ) : (
                    <BarChart data={analyticsData?.resourceRisks} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="area" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="waterRisk" name="Water Risk" fill={COLORS.water} />
                      <Bar dataKey="energyRisk" name="Energy Risk" fill={COLORS.energy} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Citizen Recommendations */}
        {analyticsData?.citizenRecommendations && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userRole === 'water-admin' 
                  ? 'Water Conservation Alerts Calendar' 
                  : userRole === 'energy-admin' 
                  ? 'Energy Conservation Alerts Calendar' 
                  : 'Resource Conservation Alerts'}
              </CardTitle>
              <CardDescription>
                Seasonal conservation recommendations for citizens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Month</th>
                      <th className="p-2 text-left">Alert Status</th>
                      <th className="p-2 text-left">Conservation Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData?.citizenRecommendations?.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                        <td className="p-2">{item.month}</td>
                        <td className="p-2">
                          <span 
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.level === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : item.level === 'medium' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {item.alert}
                          </span>
                        </td>
                        <td className="p-2">{item.conservation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {userRole !== 'citizen' && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Citizen notification template:</h4>
                  <div className="p-3 border rounded bg-muted/30">
                    <p className="text-sm">
                      <span className="font-semibold">PCMC {userRole === 'water-admin' ? 'Water' : 'Energy'} Alert:</span> 
                      {userRole === 'water-admin'
                        ? " Based on current reservoir levels and summer demand projections, we advise residents to prepare for possible water supply timing changes. Please store adequate water and report leakages promptly."
                        : " Due to anticipated high summer demand, occasional load management may be necessary during peak hours (6-10 PM). Please minimize heavy appliance usage during these hours."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Expected Complaint Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Expected Complaint Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <CustomComposedChart data={analyticsData?.expectedVolume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="expected" fill="#8884d8" name="Expected Complaints" />
                  <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#82ca9d" name="Confidence %" />
                </CustomComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Time Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Time Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.resolutionPredictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#8884d8" name="Current (days)" />
                  <Bar dataKey="predicted" fill="#82ca9d" name="Predicted (days)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resource Allocation Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Resource Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData?.resourceAllocation}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#8884d8" name="Current %" />
                  <Bar dataKey="recommended" fill="#82ca9d" name="Recommended %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default ComplaintsAnalytics;
