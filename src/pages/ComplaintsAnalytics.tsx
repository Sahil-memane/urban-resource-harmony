
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ComplaintsAnalytics from '@/components/complaints/ComplaintsAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart4, 
  TrendingUp, 
  Lightbulb, 
  HelpCircle,
  AlertTriangle,
  Droplet,
  Zap
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ComplaintsAnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { userRole } = useUserRole();
  const [advisories, setAdvisories] = useState<any[]>([]);

  useEffect(() => {
    // Generate dynamic advisories based on user role
    generateAdvisories();
  }, [userRole]);

  const generateAdvisories = () => {
    // Dynamic advisory generation based on role and recent data
    const waterAdvisories = [
      {
        title: "Seasonal Low Pressure Alert",
        description: "Based on seasonal patterns, water supply pressure may be reduced during April-May. Consider storing water and reporting any leakages promptly.",
        category: "water",
        severity: "medium",
        icon: <Droplet className="h-5 w-5 text-blue-600" />
      },
      {
        title: "Conservation Reminder",
        description: "Water usage is approaching seasonal peaks. To avoid shortages, consider using washing machines with full loads only and fixing any leaking taps.",
        category: "water",
        severity: "low",
        icon: <Droplet className="h-5 w-5 text-blue-500" />
      },
      {
        title: "Quality Notice",
        description: "Recent testing shows slightly higher turbidity levels in sectors 15-18. The water remains safe to drink, but additional filtering is recommended.",
        category: "water",
        severity: "medium",
        icon: <Droplet className="h-5 w-5 text-blue-600" />
      }
    ];

    const energyAdvisories = [
      {
        title: "Peak Load Warning",
        description: "Energy demand is expected to peak between 6-10 PM. To prevent outages, minimize usage of high-consumption appliances during these hours.",
        category: "energy",
        severity: "high",
        icon: <Zap className="h-5 w-5 text-yellow-600" />
      },
      {
        title: "Maintenance Notice",
        description: "Scheduled maintenance will affect Sector 21 on Saturday from 10 AM to 2 PM. Please plan accordingly.",
        category: "energy",
        severity: "medium",
        icon: <Zap className="h-5 w-5 text-yellow-500" />
      },
      {
        title: "Energy Saving Tip",
        description: "Setting your AC temperature to 24°C instead of 22°C can reduce your power consumption by up to 10% while maintaining comfort.",
        category: "energy",
        severity: "low",
        icon: <Zap className="h-5 w-5 text-yellow-400" />
      }
    ];

    // Filter advisories based on user role
    if (userRole === 'water-admin') {
      setAdvisories([...waterAdvisories]);
    } else if (userRole === 'energy-admin') {
      setAdvisories([...energyAdvisories]);
    } else if (userRole === 'admin') {
      setAdvisories([...waterAdvisories, ...energyAdvisories]);
    } else {
      // For citizens, show a mix of advisories most relevant to them
      setAdvisories([waterAdvisories[0], energyAdvisories[0], waterAdvisories[2]]);
    }
  };

  // Helper function to get severity class
  const getSeverityClass = (severity: string) => {
    switch(severity) {
      case 'high':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20';
      case 'medium':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20';
      case 'low':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20';
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
        <h1 className="text-3xl font-bold mb-2">Complaints Analytics</h1>
        
        <div className="mb-6">
          <Card className={`border-blue-200 bg-blue-50 dark:bg-blue-950/20 mb-4`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-blue-800 dark:text-blue-400">Advisory</CardTitle>
                </div>
                <Button variant="outline" size="sm" asChild className="text-blue-600 border-blue-300">
                  <Link to="/advisory">View All Advisories</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {advisories.slice(0, 1).map((advisory, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {advisory.icon}
                    <div>
                      <h4 className="font-medium text-sm">{advisory.title}</h4>
                      <p className="text-sm text-muted-foreground">{advisory.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {userRole === 'water-admin' 
            ? 'Comprehensive analytics for water-related complaints and PCMC water resource data.'
            : userRole === 'energy-admin'
            ? 'Comprehensive analytics for energy-related complaints and PCMC power distribution data.'
            : 'Comprehensive analytics dashboard for all citizen complaints and PCMC resource data.'}
        </p>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Predictions</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <ComplaintsAnalytics viewType="overview" />
          </TabsContent>
          
          <TabsContent value="trends">
            <ComplaintsAnalytics viewType="trends" />
          </TabsContent>
          
          <TabsContent value="predictions">
            <ComplaintsAnalytics viewType="predictions" />
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default ComplaintsAnalyticsPage;
