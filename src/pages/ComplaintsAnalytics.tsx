
import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

const ComplaintsAnalyticsPage = () => {
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
        <h1 className="text-3xl font-bold mb-2">Complaints Analytics</h1>
        
        {userRole === 'citizen' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-yellow-800 dark:text-yellow-400">PCMC Service Advisory</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                Based on seasonal patterns, water supply pressure may be reduced during April-May. 
                Consider storing water and reporting any leakages promptly. Energy demand is also expected 
                to peak - minimize usage during 6-10pm to avoid potential outages.
              </p>
            </CardContent>
          </Card>
        )}
        
        {userRole !== 'citizen' && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {userRole === 'water-admin' 
              ? 'Comprehensive analytics for water-related complaints and PCMC water resource data.'
              : userRole === 'energy-admin'
              ? 'Comprehensive analytics for energy-related complaints and PCMC power distribution data.'
              : 'Comprehensive analytics dashboard for all citizen complaints and PCMC resource data.'}
          </p>
        )}
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart4 size={16} />
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
