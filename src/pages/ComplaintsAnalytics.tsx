
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ComplaintsAnalytics from '@/components/complaints/ComplaintsAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart4, 
  TrendingUp, 
  Lightbulb, 
  HelpCircle
} from 'lucide-react';

const ComplaintsAnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
