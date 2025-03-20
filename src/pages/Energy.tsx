
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Zap, 
  TrendingUp, 
  BarChart, 
  PieChart, 
  AlertTriangle,
  Download,
  Info,
  ExternalLink,
  Lightbulb,
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
  Bar
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Energy = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [energyData, setEnergyData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [measurementExplanations, setMeasurementExplanations] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    fetchEnergyData();
  }, []);

  const fetchEnergyData = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      if (forceRefresh) {
        setIsRefreshing(true);
      }

      // First try to fetch from the Python server via the Edge Function
      try {
        console.log('Fetching energy data from server...');
        
        const { data, error } = await supabase.functions.invoke('python-bridge', {
          body: { 
            endpoint: 'fetch_resource_data',
            data: { resourceType: 'energy', forceRefresh }
          }
        });
        
        if (error) {
          throw error;
        }
        
        if (data?.data) {
          console.log('Energy data:', data.data);
          setEnergyData(data.data);
          
          // Extract measurement explanations if available
          if (data.data.explanations) {
            setMeasurementExplanations(data.data.explanations);
          }
          
          toast.success('Energy data updated successfully');
        } else {
          throw new Error('No data received from server');
        }

      } catch (error) {
        console.error('Error fetching energy data:', error);
        
        // Fallback to mock data
        const mockData = generateMockEnergyData();
        setEnergyData(mockData);
        
        toast.error('Could not fetch live energy data, showing sample data');
      }

    } catch (error) {
      console.error('Error in fetchEnergyData:', error);
      toast.error('Failed to load energy information');
      
      // Set mock data as fallback
      setEnergyData(generateMockEnergyData());
      
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchEnergyData(true);
    toast.success('Refreshing energy data...');
  };

  const handleViewAdvisory = () => {
    navigate('/advisory');
  };

  const generateMockEnergyData = () => {
    // Fallback mock data if server fails
    return {
      energyConsumption: [
        { year: '2018', residential: 250, industrial: 480, commercial: 180, total: 910 },
        { year: '2019', residential: 270, industrial: 510, commercial: 190, total: 970 },
        { year: '2020', residential: 260, industrial: 490, commercial: 185, total: 935 },
        { year: '2021', residential: 280, industrial: 520, commercial: 195, total: 995 },
        { year: '2022', residential: 300, industrial: 550, commercial: 205, total: 1055 },
        { year: '2023', residential: 320, industrial: 580, commercial: 215, total: 1115 },
      ],
      energySources: [
        { name: 'Thermal', value: 65 },
        { name: 'Hydro', value: 20 },
        { name: 'Renewable', value: 10 },
        { name: 'Nuclear', value: 5 },
      ],
      energyQuality: [
        { month: 'Jan', 'voltage': 220.5, 'frequency': 49.8, 'outages': 2 },
        { month: 'Feb', 'voltage': 221.2, 'frequency': 50.1, 'outages': 1 },
        { month: 'Mar', 'voltage': 219.8, 'frequency': 50.0, 'outages': 3 },
        { month: 'Apr', 'voltage': 218.5, 'frequency': 49.9, 'outages': 5 },
        { month: 'May', 'voltage': 217.2, 'frequency': 49.7, 'outages': 7 },
        { month: 'Jun', 'voltage': 219.1, 'frequency': 49.8, 'outages': 6 },
        { month: 'Jul', 'voltage': 220.3, 'frequency': 50.1, 'outages': 4 },
        { month: 'Aug', 'voltage': 221.5, 'frequency': 50.2, 'outages': 2 },
        { month: 'Sep', 'voltage': 220.8, 'frequency': 50.0, 'outages': 1 },
        { month: 'Oct', 'voltage': 219.9, 'frequency': 49.9, 'outages': 2 },
        { month: 'Nov', 'voltage': 220.2, 'frequency': 50.0, 'outages': 3 },
        { month: 'Dec', 'voltage': 220.6, 'frequency': 50.1, 'outages': 3 },
      ],
      seasonalDemand: [
        { name: 'Winter', demand: 950, capacity: 1200, peak: 1050 },
        { name: 'Summer', demand: 1250, capacity: 1200, peak: 1050 },
        { name: 'Monsoon', demand: 880, capacity: 1200, peak: 1050 },
        { name: 'Autumn', demand: 920, capacity: 1200, peak: 1050 },
      ],
      explanations: {
        "MW": "Megawatt - Unit of power equal to one million watts, used to measure electricity generation capacity.",
        "MWh": "Megawatt Hour - Unit of energy equivalent to one megawatt of power sustained for one hour.",
        "kWh": "Kilowatt Hour - Standard unit for measuring electricity consumption in homes.",
        "T&D Losses": "Transmission and Distribution Losses - Percentage of electricity lost during transmission from generation to consumption.",
        "Peak Demand": "Highest amount of electricity drawn from the grid at any given time, measured in MW.",
        "Voltage": "Standard household voltage in India is 230V ± 10%. Deviations can damage appliances.",
        "Frequency": "Standard grid frequency in India is 50 Hz. Variations indicate grid instability."
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
    if (!energyData) return null;

    return (
      <div className="space-y-6">
        <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            Energy demand is expected to peak during summer months. Minimize usage during 6-10 PM to avoid potential outages and higher tariffs.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Historical Energy Consumption</CardTitle>
              <CardDescription>PCMC energy consumption trends (2018-2023)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyData.energyConsumption}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="residential" 
                      stroke="#8884d8" 
                      name="Residential (MWh)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="industrial" 
                      stroke="#82ca9d" 
                      name="Industrial (MWh)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="commercial" 
                      stroke="#ffc658" 
                      name="Commercial (MWh)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#ff7300" 
                      name="Total (MWh)" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {renderMeasurementNote("MWh")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Energy Sources</CardTitle>
              <CardDescription>Distribution of PCMC energy supply sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energyData.energySources}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {energyData.energySources.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            index === 0 ? '#F6AD55' : // Thermal
                            index === 1 ? '#4299E1' : // Hydro
                            index === 2 ? '#68D391' : // Renewable
                            '#FC8181'                 // Nuclear
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
                Percentage of total energy supply by source
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Power Quality Trends</CardTitle>
            <CardDescription>Monthly power quality parameters in PCMC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyData.energyQuality}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" domain={[210, 230]} />
                  <YAxis yAxisId="right" orientation="right" domain={[49, 51]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="voltage" 
                    stroke="#8884d8" 
                    name="Voltage (V)" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="frequency" 
                    stroke="#82ca9d" 
                    name="Frequency (Hz)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-3">
              {renderMeasurementNote("Voltage")}
              {renderMeasurementNote("Frequency")}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button variant="outline" className="gap-2" onClick={handleViewAdvisory}>
            <Info className="h-4 w-4" />
            View Energy Advisory
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate('/complaints')}>
            <Zap className="h-4 w-4" />
            Report Energy Issue
          </Button>
        </div>
      </div>
    );
  };

  const renderTrendsTab = () => {
    if (!energyData) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Energy Demand Patterns</CardTitle>
            <CardDescription>Seasonal variations in energy demand based on PCMC data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyData.seasonalDemand}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#F6AD55" 
                    fill="#F6AD55" 
                    fillOpacity={0.6}
                    name="Energy Demand (MW)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="capacity" 
                    stroke="#82ca9d" 
                    name="Capacity (MW)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="peak" 
                    stroke="#ff7300" 
                    name="Peak Capacity (MW)" 
                    strokeDasharray="5 5" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-3">
              {renderMeasurementNote("MW")}
              {renderMeasurementNote("Peak Demand")}
            </div>
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
          <p className="ml-2">Loading energy analytics...</p>
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
              <Zap className="inline-block mr-2 h-8 w-8 text-yellow-500" />
              Energy Resources
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive information about PCMC energy resources, consumption patterns, and conservation advice.
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
              <BarChart size={16} />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp size={16} />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <PieChart size={16} />
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
                  <CardTitle>Future Energy Demand Predictions</CardTitle>
                  <CardDescription>Projected energy requirements based on population growth and resource availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Detailed prediction analytics are being developed based on MSEDCL data and industrial growth projections.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default Energy;
