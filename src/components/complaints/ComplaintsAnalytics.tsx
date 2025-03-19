
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
} from 'recharts';

const COLORS = {
  water: '#4299E1',  // Blue
  energy: '#F6AD55', // Orange
  high: '#EF4444',   // Red
  medium: '#F59E0B', // Amber
  low: '#34D399',    // Green
};

const ComplaintsAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
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
          setAnalyticsData(data);
          setIsLoading(false);
          return;
        }
      } catch (pythonError) {
        console.warn('Python backend not available, falling back to client-side charts:', pythonError);
      }
      
      console.log("Using client-side generated charts");
      
      // Generate client-side analytics
      const categoryData = getCategoryAnalytics();
      const priorityData = getPriorityAnalytics();
      const trendsData = getTrendsAnalytics();
      const resolutionData = getResolutionAnalytics();
      
      setAnalyticsData({
        categoryData,
        priorityData,
        trendsData,
        resolutionData
      });
      
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast.error('Failed to generate analytics charts');
      
      // Still generate some basic charts even if there's an error
      const categoryData = getCategoryAnalytics();
      const priorityData = getPriorityAnalytics();
      const trendsData = getTrendsAnalytics();
      const resolutionData = getResolutionAnalytics();
      
      setAnalyticsData({
        categoryData,
        priorityData,
        trendsData,
        resolutionData
      });
    } finally {
      setIsLoading(false);
    }
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
                    {analyticsData?.categoryData.map((entry: any, index: number) => (
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
                    {analyticsData?.priorityData.map((entry: any, index: number) => (
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
          <CardTitle>Monthly Complaint Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="water" 
                  stroke={COLORS.water} 
                  name="Water"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke={COLORS.energy} 
                  name="Energy"
                  strokeWidth={2}
                />
              </LineChart>
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
                  {analyticsData?.resolutionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#000000'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintsAnalytics;
