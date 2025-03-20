import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2 } from 'lucide-react';

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

const ComplaintsAnalytics: React.FC<AnalyticsProps> = ({ viewType = 'overview' }) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      // Mock complaints data for demonstration
      const mockComplaints = [
        { id: '1', category: 'water', priority: 'medium', content: 'Low water pressure', source: 'text', status: 'pending', date: '2024-05-01T10:00:00.000Z', resolved_date: '2024-05-02T12:00:00.000Z' },
        { id: '2', category: 'energy', priority: 'high', content: 'Power outage', source: 'voice', status: 'in-progress', date: '2024-05-03T14:00:00.000Z', resolved_date: '2024-05-04T16:00:00.000Z' },
        { id: '3', category: 'water', priority: 'low', content: 'Leaky faucet', source: 'image', status: 'resolved', date: '2024-05-05T16:00:00.000Z', resolved_date: '2024-05-06T18:00:00.000Z' },
        { id: '4', category: 'energy', priority: 'medium', content: 'Billing issue', source: 'text', status: 'pending', date: '2024-05-07T18:00:00.000Z', resolved_date: '2024-05-08T20:00:00.000Z' },
        { id: '5', category: 'water', priority: 'high', content: 'Water contamination', source: 'voice', status: 'in-progress', date: '2024-05-09T20:00:00.000Z', resolved_date: '2024-05-10T22:00:00.000Z' },
        { id: '6', category: 'energy', priority: 'low', content: 'Streetlight not working', source: 'image', status: 'resolved', date: '2024-05-11T22:00:00.000Z', resolved_date: '2024-05-12T00:00:00.000Z' },
        { id: '7', category: 'water', priority: 'medium', content: 'Low water pressure', source: 'text', status: 'pending', date: '2024-05-13T00:00:00.000Z', resolved_date: '2024-05-14T02:00:00.000Z' },
        { id: '8', category: 'energy', priority: 'high', content: 'Power outage', source: 'voice', status: 'in-progress', date: '2024-05-15T02:00:00.000Z', resolved_date: '2024-05-16T04:00:00.000Z' },
        { id: '9', category: 'water', priority: 'low', content: 'Leaky faucet', source: 'image', status: 'resolved', date: '2024-05-17T04:00:00.000Z', resolved_date: '2024-05-18T06:00:00.000Z' },
        { id: '10', category: 'energy', priority: 'medium', content: 'Billing issue', source: 'text', status: 'pending', date: '2024-05-19T06:00:00.000Z', resolved_date: '2024-05-20T08:00:00.000Z' },
      ];
      setComplaints(mockComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAnalytics = () => {
    const categoryData = getCategoryAnalytics();
    const priorityData = getPriorityAnalytics();
    const trendsData = getTrendsAnalytics();
    const resolutionData = getResolutionAnalytics();
    const responseRateData = getResponseRateAnalytics();
    const timeOfDayData = getTimeOfDayAnalytics();

    setAnalyticsData({
      categoryData,
      priorityData,
      trendsData,
      resolutionData,
      responseRateData,
      timeOfDayData
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
    complaints.forEach(complaint => {
      const monthYear = new Date(complaint.date).toISOString().slice(0, 7);
      if (!monthlyCounts[monthYear]) {
        monthlyCounts[monthYear] = { water: 0, energy: 0 };
      }
      monthlyCounts[monthYear][complaint.category]++;
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

  // Update the getResponseRateAnalytics function to include more detailed time categories
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
    
    const responseRates: { name: string, value: number }[] = [];
    
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
    const timeOfDayCounts: { [key: string]: number } = {};
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
      timeOfDayCounts[timeOfDay] = (timeOfDayCounts[timeOfDay] || 0) + 1;
    });

    return Object.entries(timeOfDayCounts).map(([name, value]) => ({ name, value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                        fill={
                          index === 0 ? '#10B981' : // < 6 hours (bright green)
                          index === 1 ? '#34D399' : // < 12 hours (green)
                          index === 2 ? '#FBBF24' : // 12-24 hours (yellow)
                          index === 3 ? '#F59E0B' : // 24-48 hours (amber)
                          '#EF4444'                 // > 48 hours (red)
                        } 
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
      </div>
    );
  }

  function renderTrendsAnalytics() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Complaint Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="water" fill={COLORS.water} name="Water Complaints" />
                  <Bar dataKey="energy" fill={COLORS.energy} name="Energy Complaints" />
                  <Bar dataKey="total" fill="#808080" name="Total Complaints" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderPredictionsAnalytics() {
    return (
      <div>
        <p>Predictions and forecasting analytics are under development.</p>
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
