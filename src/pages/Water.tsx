
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/hooks/useUserRole';
import { Droplet, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
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
  ResponsiveContainer 
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

const waterConsumptionData = [
  { year: '2018', domestic: 410, industrial: 240, total: 650 },
  { year: '2019', domestic: 425, industrial: 245, total: 670 },
  { year: '2020', domestic: 400, industrial: 230, total: 630 },
  { year: '2021', domestic: 440, industrial: 260, total: 700 },
  { year: '2022', domestic: 460, industrial: 280, total: 740 },
  { year: '2023', domestic: 480, industrial: 290, total: 770 },
];

const waterSourceData = [
  { name: 'Pavana Dam', value: 55 },
  { name: 'Groundwater', value: 20 },
  { name: 'Indrayani River', value: 15 },
  { name: 'Other Sources', value: 10 },
];

const seasonalWaterDemand = [
  { name: 'Winter', demand: 90, supply: 110, critical: 80 },
  { name: 'Spring', demand: 95, supply: 110, critical: 80 },
  { name: 'Summer', demand: 120, supply: 110, critical: 80 },
  { name: 'Monsoon', demand: 85, supply: 110, critical: 80 },
  { name: 'Autumn', demand: 90, supply: 110, critical: 80 },
];

const waterQualityData = [
  { month: 'Jan', pH: 7.2, turbidity: 3.2, tds: 380 },
  { month: 'Feb', pH: 7.3, turbidity: 3.0, tds: 375 },
  { month: 'Mar', pH: 7.1, turbidity: 3.5, tds: 390 },
  { month: 'Apr', pH: 7.0, turbidity: 4.0, tds: 400 },
  { month: 'May', pH: 6.9, turbidity: 4.2, tds: 420 },
  { month: 'Jun', pH: 7.0, turbidity: 3.8, tds: 410 },
  { month: 'Jul', pH: 7.2, turbidity: 3.5, tds: 390 },
  { month: 'Aug', pH: 7.4, turbidity: 3.0, tds: 370 },
  { month: 'Sep', pH: 7.3, turbidity: 2.8, tds: 360 },
  { month: 'Oct', pH: 7.3, turbidity: 2.9, tds: 365 },
  { month: 'Nov', pH: 7.2, turbidity: 3.0, tds: 370 },
  { month: 'Dec', pH: 7.2, turbidity: 3.1, tds: 375 },
];

const citizenWaterAlerts = [
  {
    month: 'April-May',
    level: 'high',
    alert: 'Water Supply Reduction',
    conservation: 'Store water in clean containers during morning supply. Report leakages promptly.',
  },
  {
    month: 'June-September',
    level: 'low',
    alert: 'Normal Supply',
    conservation: 'Practice regular water conservation. Use wastewater from RO systems for plants.',
  },
  {
    month: 'October-November',
    level: 'medium',
    alert: 'Occasional Disruption',
    conservation: 'Expect occasional supply disruptions due to maintenance. Store water as needed.',
  },
  {
    month: 'December-March',
    level: 'low',
    alert: 'Normal Supply',
    conservation: 'Continue regular conservation practices. Fix any leaking taps or pipes.',
  },
];

const waterProjections = [
  { year: '2024', projected: 795, sustainable: 780 },
  { year: '2025', projected: 815, sustainable: 790 },
  { year: '2026', projected: 840, sustainable: 805 },
  { year: '2027', projected: 870, sustainable: 820 },
  { year: '2028', projected: 890, sustainable: 840 },
];

const WaterPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { userRole } = useUserRole();

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-8 px-4 md:px-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Droplet className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Water Resources</h1>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Comprehensive information about PCMC water resources, consumption patterns, and conservation advice.
        </p>
        
        {userRole === 'citizen' && (
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-800 dark:text-blue-400">PCMC Water Advisory</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Based on seasonal patterns, water supply pressure may be reduced during April-May. 
                Consider storing water and reporting any leakages promptly.
              </p>
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
                        <BarChart data={waterConsumptionData}>
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
                            data={waterSourceData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, value}) => `${name}: ${value}%`}
                          >
                            {waterSourceData.map((entry, index) => (
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
                      <LineChart data={seasonalWaterDemand}>
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
                        {citizenWaterAlerts.map((item, index) => (
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
                      <LineChart data={waterQualityData}>
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
                      <AreaChart data={waterQualityData}>
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
                  <CardDescription>PCMC water consumption trends (2018-2023)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={waterConsumptionData}>
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
                      <LineChart data={waterProjections}>
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
