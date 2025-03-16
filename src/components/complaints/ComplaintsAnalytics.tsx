
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet, Zap } from 'lucide-react';

// Sample data for charts
const categoryData = [
  { name: 'Water', value: 12, fill: '#3b82f6' },
  { name: 'Energy', value: 8, fill: '#eab308' },
];

const priorityData = [
  { name: 'High', value: 7, fill: '#ef4444' },
  { name: 'Medium', value: 10, fill: '#3b82f6' },
  { name: 'Low', value: 3, fill: '#22c55e' },
];

const monthlyData = [
  { month: 'Jan', water: 2, energy: 1 },
  { month: 'Feb', water: 3, energy: 2 },
  { month: 'Mar', water: 1, energy: 3 },
  { month: 'Apr', water: 4, energy: 2 },
  { month: 'May', water: 3, energy: 1 },
  { month: 'Jun', water: 5, energy: 3 },
];

const resolutionTimeData = [
  { category: 'Water', high: 3, medium: 5, low: 7 },
  { category: 'Energy', high: 2, medium: 4, low: 6 },
];

const chartConfig = {
  water: {
    label: 'Water',
    theme: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
  },
  energy: {
    label: 'Energy',
    theme: {
      light: '#eab308',
      dark: '#facc15',
    },
  },
  high: {
    label: 'High',
    theme: {
      light: '#ef4444',
      dark: '#f87171',
    },
  },
  medium: {
    label: 'Medium',
    theme: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
  },
  low: {
    label: 'Low',
    theme: {
      light: '#22c55e',
      dark: '#4ade80',
    },
  },
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ComplaintsAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Complaints by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Complaints by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
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
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="water" name="Water" stroke="#3b82f6" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="energy" name="Energy" stroke="#eab308" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Resolution Time (Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={resolutionTimeData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="high" name="High Priority" fill="#ef4444" />
                  <Bar dataKey="medium" name="Medium Priority" fill="#3b82f6" />
                  <Bar dataKey="low" name="Low Priority" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintsAnalytics;
