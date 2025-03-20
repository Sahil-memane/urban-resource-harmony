
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { Droplet, AlertTriangle, TrendingUp, Lightbulb, RefreshCw, Download } from 'lucide-react';
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
  primary: '#4299E1',   // blue for water
  secondary: '#90CDF4', // lighter blue
  accent: '#2C5282',    // dark blue
  neutral: '#CBD5E0',   // gray
  success: '#10B981',   // green
  warning: '#FBBF24',   // yellow
  danger: '#EF4444',    // red
};

const WaterPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { userRole } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    waterConsumption: [],
    waterSources: [],
    seasonalWaterDemand: [],
    waterQuality: [],
    waterAlerts: [],
    waterProjections: [],
    waterEfficiency: [],
    waterRisks: []
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchWaterData();
  }, []);

  const fetchWaterData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      console.log("Fetching water data...");
      const { data: result, error } = await supabase.functions.invoke('python-bridge', {
        body: { 
          endpoint: 'fetch_resource_data',
          data: { 
            resourceType: 'water',
            forceRefresh
          }
        }
      });
      
      if (error) {
        console.error("Error fetching water data:", error);
        toast.error("Failed to load water resource data");
        setLoading(false);
        return;
      }
      
      if (result.success && result.data) {
        console.log("Water data fetched successfully:", result.data);
        setData(result.data);
        setLastUpdated(new Date());
        setLoading(false);
      } else {
        console.error("Failed to fetch water data:", result);
        toast.error("Failed to load water resource data");
        setLoading(false);
      }
    } catch (err) {
      console.error("Exception fetching water data:", err);
      toast.error("Failed to load water resource data");
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing water data...");
    fetchWaterData(true);
  };

  const downloadData = () => {
    try {
      // Create a JSON blob and download it
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pcmc_water_data.json';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Water data downloaded successfully");
    } catch (err) {
      console.error("Error downloading data:", err);
      toast.error("Failed to download water data");
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
            <Droplet className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Water Resources</h1>
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
          Comprehensive information about PCMC water resources, consumption patterns, and conservation advice.
        </p>
        
        {userRole === 'citizen' && data.waterAlerts && data.waterAlerts.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-800 dark:text-blue-400">PCMC Water Advisory</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {data.waterAlerts.map((alert: any, index: number) => (
                <div key={index} className={`text-sm text-blue-800 dark:text-blue-400 ${index > 0 ? 'mt-2' : ''}`}>
                  <span className="font-semibold">{alert.month}:</span> {alert.conservation}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Droplet size={16} />
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
                    <CardTitle>PCMC Water Consumption (MLD)</CardTitle>
                    <CardDescription>Annual water consumption by sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.waterConsumption || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="domestic" fill={COLORS.primary} name="Domestic" />
                          <Bar dataKey="industrial" fill={COLORS.secondary} name="Industrial" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Water Sources</CardTitle>
                    <CardDescription>PCMC water supply sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.waterSources || []}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, value}) => `${name}: ${value}%`}
                          >
                            {(data.waterSources || []).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 45 + 200}, 70%, 50%)`} />
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
                  <CardTitle>Seasonal Water Demand vs Supply</CardTitle>
                  <CardDescription>PCMC water demand patterns throughout the year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.seasonalWaterDemand || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="demand" stroke={COLORS.primary} name="Demand (MLD)" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="supply" stroke={COLORS.success} name="Supply Capacity (MLD)" />
                        <Line type="monotone" dataKey="critical" stroke={COLORS.danger} strokeDasharray="5 5" name="Critical Level (MLD)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Water & Conservation Advisory</CardTitle>
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
                        {(data.waterAlerts || []).map((item: any, index: number) => (
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
                  <CardTitle>Water Quality Trends</CardTitle>
                  <CardDescription>Monthly water quality parameters in PCMC</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.waterQuality || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="pH" stroke="#8884d8" name="pH Level" />
                        <Line type="monotone" dataKey="turbidity" stroke="#82ca9d" name="Turbidity (NTU)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Dissolved Solids (TDS)</CardTitle>
                  <CardDescription>Monthly TDS levels in PCMC water supply</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.waterQuality || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="tds" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} name="TDS (ppm)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historical Water Consumption</CardTitle>
                  <CardDescription>PCMC water consumption trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.waterConsumption || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke={COLORS.accent} strokeWidth={2} name="Total (MLD)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Water System Efficiency Metrics</CardTitle>
                  <CardDescription>System improvements over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.waterEfficiency || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="leakage" stroke={COLORS.danger} name="Distribution Losses (%)" />
                        <Line type="monotone" dataKey="treatment" stroke={COLORS.success} name="Treatment Efficiency (%)" />
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
                  <CardTitle>Projected Water Demand</CardTitle>
                  <CardDescription>5-year projection based on PCMC growth patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.waterProjections || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="projected" stroke={COLORS.primary} name="Projected Demand (MLD)" />
                        <Line type="monotone" dataKey="sustainable" stroke={COLORS.success} name="Sustainable Supply (MLD)" strokeDasharray="3 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Water Conservation Impact</CardTitle>
                  <CardDescription>Potential water saved through conservation measures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { measure: 'Rainwater Harvesting', saving: 15 },
                          { measure: 'Leak Repair', saving: 20 },
                          { measure: 'Water Recycling', saving: 25 },
                          { measure: 'Efficient Fixtures', saving: 12 },
                          { measure: 'Drip Irrigation', saving: 18 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="measure" />
                        <YAxis label={{ value: 'Million Liters per Day', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="saving" fill={COLORS.success} name="Potential Savings (MLD)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Water Supply Risk Assessment</CardTitle>
                  <CardDescription>Area-wise risk analysis in PCMC</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={data.waterRisks || []}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="area" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Shortage Risk" dataKey="shortageRisk" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Radar name="Infrastructure Risk" dataKey="infrastructureRisk" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        <Radar name="Quality Risk" dataKey="qualityRisk" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Water Availability Forecast</CardTitle>
                  <CardDescription>Seasonal forecast for the upcoming year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { month: 'Jan', availability: 95, demand: 90 },
                          { month: 'Feb', availability: 90, demand: 92 },
                          { month: 'Mar', availability: 85, demand: 95 },
                          { month: 'Apr', availability: 80, demand: 100 },
                          { month: 'May', availability: 75, demand: 105 },
                          { month: 'Jun', availability: 85, demand: 90 },
                          { month: 'Jul', availability: 100, demand: 85 },
                          { month: 'Aug', availability: 110, demand: 85 },
                          { month: 'Sep', availability: 105, demand: 85 },
                          { month: 'Oct', availability: 100, demand: 90 },
                          { month: 'Nov', availability: 95, demand: 90 },
                          { month: 'Dec', availability: 95, demand: 90 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="availability" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} name="Availability (%)" />
                        <Area type="monotone" dataKey="demand" stroke={COLORS.danger} fill={COLORS.danger} fillOpacity={0.3} name="Demand (%)" />
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

export default WaterPage;
