
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/hooks/useUserRole';
import { Zap, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
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
  primary: '#F6AD55',  // orange for energy
  secondary: '#FBD38D', // lighter orange
  accent: '#C05621',   // dark orange
  neutral: '#CBD5E0',  // gray
  success: '#10B981',  // green
  warning: '#FBBF24',  // yellow
  danger: '#EF4444',   // red
  renewable: '#68D391', // green for renewable
  nonrenewable: '#FC8181', // red for non-renewable
};

const energyConsumptionData = [
  { year: '2018', residential: 320, commercial: 160, industrial: 280, total: 760 },
  { year: '2019', residential: 340, commercial: 180, industrial: 300, total: 820 },
  { year: '2020', residential: 320, commercial: 170, industrial: 290, total: 780 },
  { year: '2021', residential: 350, commercial: 190, industrial: 310, total: 850 },
  { year: '2022', residential: 370, commercial: 200, industrial: 330, total: 900 },
  { year: '2023', residential: 390, commercial: 210, industrial: 350, total: 950 },
];

const energySourceData = [
  { name: 'Thermal', value: 65 },
  { name: 'Renewable', value: 15 },
  { name: 'Hydro', value: 12 },
  { name: 'Other', value: 8 },
];

const dailyLoadPattern = [
  { time: '00:00', load: 60 },
  { time: '02:00', load: 50 },
  { time: '04:00', load: 45 },
  { time: '06:00', load: 60 },
  { time: '08:00', load: 90 },
  { time: '10:00', load: 95 },
  { time: '12:00', load: 90 },
  { time: '14:00', load: 85 },
  { time: '16:00', load: 80 },
  { time: '18:00', load: 85 },
  { time: '20:00', load: 100 },
  { time: '22:00', load: 80 },
];

const citizenEnergyAlerts = [
  {
    month: 'March-June',
    level: 'high',
    alert: 'Peak Load Hours',
    conservation: 'Avoid using high-power appliances from 6-10 PM. Use energy-efficient LED lighting.',
  },
  {
    month: 'July-October',
    level: 'medium',
    alert: 'Moderate Load',
    conservation: 'Use natural ventilation when possible instead of air conditioning during pleasant weather.',
  },
  {
    month: 'November-February',
    level: 'low',
    alert: 'Normal Load',
    conservation: 'Continue regular energy conservation. Turn off lights and appliances when not in use.',
  },
];

const outagePerformanceData = [
  { year: '2018', saidi: 12.8, saifi: 8.4 },
  { year: '2019', saidi: 11.5, saifi: 7.8 },
  { year: '2020', saidi: 10.2, saifi: 7.1 },
  { year: '2021', saidi: 8.7, saifi: 6.5 },
  { year: '2022', saidi: 7.9, saifi: 5.8 },
  { year: '2023', saidi: 7.1, saifi: 5.2 },
];

const renewableGrowthData = [
  { year: '2018', solar: 5, wind: 2, biomass: 1 },
  { year: '2019', solar: 7, wind: 3, biomass: 1 },
  { year: '2020', solar: 9, wind: 3, biomass: 2 },
  { year: '2021', solar: 12, wind: 4, biomass: 2 },
  { year: '2022', solar: 15, wind: 5, biomass: 3 },
  { year: '2023', solar: 18, wind: 6, biomass: 3 },
];

const energyProjections = [
  { year: '2024', projected: 1000, capacity: 1050 },
  { year: '2025', projected: 1070, capacity: 1100 },
  { year: '2026', projected: 1150, capacity: 1160 },
  { year: '2027', projected: 1220, capacity: 1220 },
  { year: '2028', projected: 1300, capacity: 1280 },
];

const EnergyPage = () => {
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
          <Zap className="h-6 w-6 text-orange-500" />
          <h1 className="text-3xl font-bold">Energy Resources</h1>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Comprehensive information about PCMC energy resources, consumption patterns, and conservation advice.
        </p>
        
        {userRole === 'citizen' && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800 dark:text-orange-400">PCMC Energy Advisory</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 dark:text-orange-400">
                Energy demand is expected to peak during summer months. 
                Minimize usage during 6-10pm to avoid potential outages.
              </p>
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
                    <CardTitle>PCMC Energy Consumption (MWh)</CardTitle>
                    <CardDescription>Annual energy consumption by sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={energyConsumptionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="residential" fill={COLORS.primary} name="Residential" />
                          <Bar dataKey="commercial" fill={COLORS.secondary} name="Commercial" />
                          <Bar dataKey="industrial" fill={COLORS.accent} name="Industrial" />
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
                            data={energySourceData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, value}) => `${name}: ${value}%`}
                          >
                            {energySourceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 30 + 15}, 70%, 50%)`} />
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
                  <CardTitle>Daily Load Pattern</CardTitle>
                  <CardDescription>Typical 24-hour electricity load in PCMC</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyLoadPattern}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="load" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} name="Load (% of peak)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Energy Conservation Advisory</CardTitle>
                  <CardDescription>Based on PCMC seasonal patterns</CardDescription>
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
                        {citizenEnergyAlerts.map((item, index) => (
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
                  <CardTitle>Reliability Performance</CardTitle>
                  <CardDescription>PCMC power outage frequency and duration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={outagePerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="saidi" stroke={COLORS.primary} name="SAIDI (hours/year)" />
                        <Line type="monotone" dataKey="saifi" stroke={COLORS.secondary} name="SAIFI (interruptions/year)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>SAIDI: System Average Interruption Duration Index</p>
                    <p>SAIFI: System Average Interruption Frequency Index</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Renewable Energy Growth</CardTitle>
                  <CardDescription>Renewable energy adoption in PCMC</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={renewableGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="solar" stackId="1" stroke={COLORS.primary} fill={COLORS.primary} name="Solar (%)" />
                        <Area type="monotone" dataKey="wind" stackId="1" stroke={COLORS.secondary} fill={COLORS.secondary} name="Wind (%)" />
                        <Area type="monotone" dataKey="biomass" stackId="1" stroke={COLORS.accent} fill={COLORS.accent} name="Biomass (%)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historical Energy Consumption</CardTitle>
                  <CardDescription>PCMC energy consumption trends (2018-2023)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={energyConsumptionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke={COLORS.accent} strokeWidth={2} name="Total (MWh)" />
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
                      <LineChart data={energyProjections}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="projected" stroke={COLORS.primary} name="Projected Demand (MWh)" />
                        <Line type="monotone" dataKey="capacity" stroke={COLORS.success} name="Available Capacity (MWh)" strokeDasharray="3 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Energy Conservation Potential</CardTitle>
                  <CardDescription>Energy that could be saved through different measures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { measure: 'LED Lighting', saving: 8 },
                          { measure: 'Efficient Appliances', saving: 12 },
                          { measure: 'Smart Controls', saving: 7 },
                          { measure: 'Insulation', saving: 10 },
                          { measure: 'Solar Installation', saving: 15 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="measure" />
                        <YAxis label={{ value: 'Percent Reduction', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="saving" fill={COLORS.success} name="Potential Savings (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Future Energy Mix</CardTitle>
                  <CardDescription>Projected changes in energy sources by 2030</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={[
                        { subject: 'Thermal', current: 65, future: 45 },
                        { subject: 'Solar', current: 10, future: 25 },
                        { subject: 'Wind', current: 5, future: 15 },
                        { subject: 'Hydro', current: 12, future: 10 },
                        { subject: 'Other Renewable', current: 8, future: 5 },
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Current (2023)" dataKey="current" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.5} />
                        <Radar name="Projected (2030)" dataKey="future" stroke={COLORS.renewable} fill={COLORS.renewable} fillOpacity={0.5} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
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
