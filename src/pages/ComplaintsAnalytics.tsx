
import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ComplaintsAnalytics from '@/components/complaints/ComplaintsAnalytics';

const ComplaintsAnalyticsPage = () => {
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-8 px-4 md:px-6"
      >
        <h1 className="text-3xl font-bold mb-6">Complaints Analytics</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <ComplaintsAnalytics />
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                Trend analysis will be implemented with Python backend integration
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="predictions">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                AI predictions will be implemented with Python backend integration
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default ComplaintsAnalyticsPage;
