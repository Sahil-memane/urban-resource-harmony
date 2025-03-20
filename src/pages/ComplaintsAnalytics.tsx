
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ComplaintsAnalytics from '@/components/complaints/ComplaintsAnalytics';
import { 
  BarChart4, 
  TrendingUp, 
  Lightbulb,
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Complaints Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-0">
              {userRole === 'water-admin' 
                ? 'Comprehensive analytics for water-related complaints and PCMC water resource data.'
                : userRole === 'energy-admin'
                ? 'Comprehensive analytics for energy-related complaints and PCMC power distribution data.'
                : 'Comprehensive analytics dashboard for all citizen complaints and PCMC resource data.'}
            </p>
          </div>
          
          <Button variant="outline" asChild className="gap-2">
            <Link to="/advisory">
              <Lightbulb className="h-4 w-4" />
              <span>View Advisories</span>
            </Link>
          </Button>
        </div>
        
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
