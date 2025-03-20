import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Droplet, 
  TrendingUp, 
  BarChart, 
  PieChart as PieChartIcon, 
  AlertTriangle,
  Download,
  Info,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Water = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [waterData, setWaterData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [measurementExplanations, setMeasurementExplanations] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    fetchWaterData();
  }, []);

  const fetchWaterData = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      if (forceRefresh) {
        setIsRefreshing(true);
      }

      // First try to fetch from the Python server via the Edge Function
      try {
        console.log('Fetching water data from server...');
        
        const { data, error } = await supabase.functions.invoke('python-bridge', {
          body: { 
            endpoint: 'fetch_resource_data',
            data: { resourceType: 'water', forceRefresh }
          }
        });
        
        if (error) {
          throw error;
        }
        
        if (data?.data) {
          console.log('Water data:', data.data);
          setWaterData(data.data);
          
          // Extract measurement explanations if available
          if (data.data.explanations) {
            setMeasurementExplanations(data.data.explanations);
          }
          
          toast.success('Water data updated successfully');
        } else {
          throw new Error('No data received from server');
        }

      } catch (error) {
        console.error('Error fetching water data:', error);
        
        // Fallback to mock data
        const mockData = generateMockWaterData();
        setWaterData(mockData);
        
        toast.error('Could not fetch live water data, showing sample data');
      }

    } catch (error) {
      console.error('Error in fetchWaterData:', error);
      toast.error('Failed to load water information');
      
      // Set mock data as fallback
      setWaterData(generateMockWaterData());
      
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchWaterData(true);
    toast.success('Refreshing water data...');
  };

  const handleViewAdvisory = () => {
    navigate('/advisory');
  };

  const generateMockWaterData = () => {
    // Fallback mock data if server fails
    return {
      waterConsumption: [
        { year: '2018', domestic: 450, industrial: 200, total: 650 },
        { year: '2019', domestic: 470, industrial: 210, total: 680 },
        { year: '2020', domestic: 460, industrial: 180, total: 640 },
        { year: '2021', domestic: 480, industrial: 220, total: 700 },
        { year: '2022', domestic: 500, industrial: 240, total: 740 },
        { year: '2023', domestic: 520, industrial: 260, total: 780 },
      ],
      waterSources: [
        { name: 'Pavana Dam', value: 75 },
        { name: 'Groundwater', value: 15 },
        { name: 'Indrayani River', value: 10 },
      ],
      waterQuality: [
        { month: 'Jan', 'pH': 7.2, 'turbidity': 3.1, 'tds': 340 },
        { month: 'Feb', 'pH': 7.5, 'turbidity': 2.9, 'tds': 320 },
        { month: 'Mar', 'pH': 7.3, 'turbidity': 3.5, 'tds': 350 },
        { month: 'Apr', 'pH': 7.1, 'turbidity': 4.2, 'tds': 380 },
        { month: 'May', 'pH': 7.0, 'turbidity': 4.0, 'tds': 390 },
        { month: 'Jun', 'pH': 7.3, 'turbidity': 3.7, 'tds': 360 },
        { month: 'Jul', 'pH': 7.5, 'turbidity': 3.4, 'tds': 330 },
        { month: 'Aug', 'pH': 7.7, 'turbidity': 2.8, 'tds': 300 },
        { month: 'Sep', 'pH': 7.6, 'turbidity': 2.7, 'tds': 290 },
        { month: 'Oct', 'pH': 7.4, 'turbidity': 2.9, 'tds': 310 },
        { month: 'Nov', 'pH': 7.3, 'turbidity': 3.0, 'tds': 320 },
        { month: 'Dec', 'pH': 7.2, 'turbidity': 3.2, 'tds': 330 },
      ],
      seasonalDemand: [
        { name: 'Winter', demand: 650, supply: 780, critical: 600 },
        { name: 'Summer', demand: 820, supply: 780, critical: 600 },
        { name: 'Monsoon', demand: 580, supply: 780, critical: 600 },
        { name: 'Autumn', demand: 620, supply: 780, critical: 600 },
      ],
      explanations: {
        "pH Level": "Measures how acidic or basic water is. The ideal range is 6.5-8.5, with 7 being neutral.",
        "Turbidity (NTU)": "Measures water cloudiness. Lower values indicate clearer water. PCMC standards require <5 NTU.",
        "Total Dissolved Solids (TDS)": "Measures inorganic salts and small organic matter dissolved in water. Ideal range is 300-500 mg/L.",
        "MLD": "Million Liters per Day - Standard unit for measuring water volume in municipal supply systems."
      }
    };
  };

  const renderMeasurementNote = (metricKey: string) => {
    if (measurementExplanations[metricKey]) {
      return (
        <div className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
          <Info className="h-3 w-3 shrink-0 mt-0.5" />
          <span>{measurementExplanations[metricKey]}</span>
        </div>
      );
    }
    return null;
  };

  const renderOverviewTab = () => {
    if (!waterData) return null;

    return (
      <div className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            Based on seasonal patterns, water supply pressure may be reduced during April-May. 
            Consider storing water and reporting any leakages promptly.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Historical Water Consumption</CardTitle>
              <CardDescription>PCMC water consumption trends (2018-2023)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={waterData.waterConsumption}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="domestic" 
                      stroke="#8884d8" 
                      name="Domestic (MLD)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="industrial" 
                      stroke="#82ca9d" 
                      name="Industrial (MLD)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#ff7300" 
                      name="Total (MLD)" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {renderMeasurementNote("MLD")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Water Sources</CardTitle>
              <CardDescription>Distribution of PCMC water supply sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={waterData.waterSources}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {waterData.waterSources.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            index === 0 ? '#4299E1' : // Primary source
                            index === 1 ? '#63B3ED' : // Secondary source
                            '#90CDF4'                 // Tertiary source
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Percentage of total water supply by source
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Water Quality Trends</CardTitle>
            <CardDescription>Monthly water quality parameters in PCMC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={waterData.waterQuality}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pH" 
                    stroke="#8884d8" 
                    name="pH Level" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="turbidity" 
                    stroke="#82ca9d" 
                    name="Turbidity (NTU)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tds" 
                    stroke="#ffc658" 
                    name="Total Dissolved Solids (ppm)" 
                    yAxisId="right"
                    hide={true} // Hidden by default to keep chart readable
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-3">
              {renderMeasurementNote("pH Level")}
              {renderMeasurementNote("Turbidity (NTU)")}
              {renderMeasurementNote("Total Dissolved Solids (TDS)")}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button variant="outline" className="gap-2" onClick={handleViewAdvisory}>
            <Info className="h-4 w-4" />
            View Water Advisory
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate('/complaints')}>
            <Droplet className="h-4 w-4" />
            Report Water Issue
          </Button>
        </div>
      </div>
    );
  };

  const renderTrendsTab = () => {
    if (!waterData) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Water Demand Patterns</CardTitle>
            <CardDescription>Seasonal variations in water demand based on PCMC data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waterData.seasonalDemand}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="Water Demand (MLD)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="supply" 
                    stroke="#82ca9d" 
                    name="Supply Capacity (MLD)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="critical" 
                    stroke="#ff7300" 
                    name="Critical Level (MLD)" 
                    strokeDasharray="5 5" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {renderMeasurementNote("MLD")}
          </CardContent>
        </Card>

        {/* Additional cards for the Trends tab would go here */}
      </div>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading water analytics...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-8 px-4 md:px-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <Droplet className="inline-block mr-2 h-8 w-8 text-blue-500" />
              Water Resources
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive information about PCMC water resources, consumption patterns, and conservation advice.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Refresh Data</span>
          </Button>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              <span>Predictions</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {renderOverviewTab()}
          </TabsContent>
          
          <TabsContent value="trends">
            {renderTrendsTab()}
          </TabsContent>
          
          <TabsContent value="predictions">
            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Future Water Demand Predictions</CardTitle>
                  <CardDescription>Projected water requirements based on population growth and resource availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Detailed prediction analytics are being developed based on PCMC infrastructure data.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default Water;
