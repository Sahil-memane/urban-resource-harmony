
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { Zap, AlertTriangle, TrendingUp, Lightbulb, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const COLORS = {
  primary: '#F6AD55',   // orange for energy
  secondary: '#FBD38D', // lighter orange
  accent: '#C05621',    // dark orange
  neutral: '#CBD5E0',   // gray
  success: '#10B981',   // green
  warning: '#FBBF24',   // yellow
  danger: '#EF4444',    // red
  renewable: '#68D391',  // green for renewable
  coal: '#4A5568',       // dark gray for coal
  gas: '#A0AEC0',        // medium gray for natural gas
};

const EnergyPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { userRole } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    energyConsumption: [],
    energySources: [],
    seasonalEnergyDemand: [],
    energyQuality: [],
    energyAlerts: [],
    energyProjections: [],
    energyEfficiency: [],
    energyRisks: []
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchEnergyData();
  }, []);

  const fetchEnergyData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      console.log("Fetching energy data...");
      const { data: result, error } = await supabase.functions.invoke('python-bridge', {
        body: { 
          endpoint: 'fetch_resource_data',
          data: { 
            resourceType: 'energy',
            forceRefresh
          }
        }
      });
      
      if (error) {
        console.error("Error fetching energy data:", error);
        toast.error("Failed to load energy resource data");
        setLoading(false);
        return;
      }
      
      if (result.success && result.data) {
        console.log("Energy data fetched successfully:", result.data);
        setData(result.data);
        setLastUpdated(new Date());
        setLoading(false);
      } else {
        console.error("Failed to fetch energy data:", result);
        toast.error("Failed to load energy resource data");
        setLoading(false);
      }
    } catch (err) {
      console.error("Exception fetching energy data:", err);
      toast.error("Failed to load energy resource data");
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing energy data...");
    fetchEnergyData(true);
  };

  const downloadData = () => {
    try {
      // Create a JSON blob and download it
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pcmc_energy_data.json';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Energy data downloaded successfully");
    } catch (err) {
      console.error("Error downloading data:", err);
      toast.error("Failed to download energy data");
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-8 px-4 md:px-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-orange-500" />
            <h1 className="text-3xl font-bold">Energy Resources</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={downloadData}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Comprehensive information about PCMC energy consumption, distribution, and conservation advice.
        </p>
        
        {userRole === 'citizen' && data.energyAlerts && data.energyAlerts.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800 dark:text-orange-400">PCMC Energy Advisory</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {data.energyAlerts.map((alert: any, index: number) => (
                <div key={index} className={`text-sm text-orange-800 dark:text-orange-400 ${index > 0 ? 'mt-2' : ''}`}>
                  <span className="font-semibold">{alert.month}:</span> {alert.conservation}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Zap size={16} />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp size={16} />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Lightbulb size={16} />
              <span>Predictions</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>PCMC Energy Consumption (GWh)</CardTitle>
                    <CardDescription>Annual electricity consumption by sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.energyConsumption || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="residential" fill="#8884d8" name="Residential" />
                          <Bar dataKey="industrial" fill="#82ca9d" name="Industrial" />
                          <Bar dataKey="commercial" fill="#ffc658" name="Commercial" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Energy Sources</CardTitle>
                    <CardDescription>PCMC electricity supply sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.energySources || []}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, value}) => `${name}: ${value}%`}
                          >
                            {(data.energySources || []).map((entry: any, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.name === 'Renewable' ? COLORS.renewable :
                                  entry.name === 'Coal' ? COLORS.coal :
                                  entry.name === 'Natural Gas' ? COLORS.gas :
                                  `hsl(${index * 45 + 20}, 70%, 50%)`
                                } 
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Energy Demand vs Capacity</CardTitle>
                  <CardDescription>PCMC power demand patterns throughout the year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.seasonalEnergyDemand || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="demand" stroke={COLORS.primary} name="Demand (MW)" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="capacity" stroke={COLORS.success} name="Capacity (MW)" />
                        <Line type="monotone" dataKey="peak" stroke={COLORS.danger} strokeDasharray="5 5" name="Peak Capacity (MW)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Energy Conservation Advisory</CardTitle>
                  <CardDescription>Based on PCMC historical patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto max-h-[400px]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Period</th>
                          <th className="p-2 text-left">Alert Status</th>
                          <th className="p-2 text-left">Conservation Advice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data.energyAlerts || []).map((item: any, index: number) => (
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
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Power Quality Metrics</CardTitle>
                  <CardDescription>Monthly reliability parameters in PCMC</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.energyQuality || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="stability" stroke={COLORS.success} name="Grid Stability (%)" />
                        <Line yAxisId="right" type="monotone" dataKey="outages" stroke={COLORS.danger} name="Outages (hrs/month)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Voltage Stability</CardTitle>
                  <CardDescription>Monthly voltage levels in PCMC power supply</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.energyQuality || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[200, 240]} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="voltage" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} name="Voltage (V)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historical Energy Consumption</CardTitle>
                  <CardDescription>PCMC energy consumption trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.energyConsumption || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke={COLORS.accent} strokeWidth={2} name="Total (GWh)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Energy System Efficiency Metrics</CardTitle>
                  <CardDescription>System improvements over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.energyEfficiency || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="losses" stroke={COLORS.danger} name="T&D Losses (%)" />
                        <Line type="monotone" dataKey="renewable" stroke={COLORS.success} name="Renewable Mix (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="predictions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projected Energy Demand</CardTitle>
                  <CardDescription>5-year projection based on PCMC growth patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.energyProjections || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="projected" stroke={COLORS.primary} name="Projected Demand (MW)" />
                        <Line type="monotone" dataKey="capacity" stroke={COLORS.success} name="Grid Capacity (MW)" strokeDasharray="3 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Energy Conservation Impact</CardTitle>
                  <CardDescription>Potential energy saved through conservation measures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { measure: 'Solar Installation', saving: 25 },
                          { measure: 'Energy Star Appliances', saving: 18 },
                          { measure: 'LED Lighting', saving: 12 },
                          { measure: 'Smart Grids', saving: 20 },
                          { measure: 'Industrial Efficiency', saving: 30 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="measure" />
                        <YAxis label={{ value: 'Megawatts Saved', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="saving" fill={COLORS.success} name="Potential Savings (MW)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Energy Supply Risk Assessment</CardTitle>
                  <CardDescription>Area-wise risk analysis in PCMC</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={data.energyRisks || []}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="area" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Outage Risk" dataKey="outageRisk" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Radar name="Capacity Risk" dataKey="capacityRisk" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        <Radar name="Infrastructure Risk" dataKey="infrastructureRisk" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Load Forecast</CardTitle>
                  <CardDescription>Monthly peak load forecast for the upcoming year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { month: 'Jan', peak: 230, capacity: 280 },
                          { month: 'Feb', peak: 225, capacity: 280 },
                          { month: 'Mar', peak: 240, capacity: 280 },
                          { month: 'Apr', peak: 255, capacity: 280 },
                          { month: 'May', peak: 270, capacity: 280 },
                          { month: 'Jun', peak: 265, capacity: 280 },
                          { month: 'Jul', peak: 240, capacity: 280 },
                          { month: 'Aug', peak: 235, capacity: 280 },
                          { month: 'Sep', peak: 230, capacity: 280 },
                          { month: 'Oct', peak: 235, capacity: 280 },
                          { month: 'Nov', peak: 225, capacity: 280 },
                          { month: 'Dec', peak: 230, capacity: 280 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="peak" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} name="Peak Load (MW)" />
                        <Line type="monotone" dataKey="capacity" stroke={COLORS.danger} strokeDasharray="3 3" name="Grid Capacity (MW)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default EnergyPage;
