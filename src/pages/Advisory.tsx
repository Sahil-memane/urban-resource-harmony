
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Droplet,
  Zap,
  AlertTriangle,
  Info,
  Lightbulb,
  Link as LinkIcon,
  FileText,
  Download,
  Calendar
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Advisory = () => {
  const [activeTab, setActiveTab] = useState('current');
  const { userRole } = useUserRole();
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    // Fetch complaints for analytics to generate advisories
    fetchComplaints();
  }, []);

  useEffect(() => {
    // Generate dynamic advisories based on user role and complaints data
    if (complaints.length > 0) {
      generateAdvisories();
    }
  }, [complaints, userRole]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("Fetched complaints for advisory:", data?.length || 0);

      if (data && data.length > 0) {
        setComplaints(data);
      } else {
        // If no real data is available, use mock data for demonstration
        console.log("No complaints found, using mock data");
        setIsLoading(false); // Set loading to false before generating mock advisories
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAdvisories = () => {
    // Analyze complaints data to generate dynamic advisories
    const waterAdvisories = generateWaterAdvisories();
    const energyAdvisories = generateEnergyAdvisories();

    // Filter advisories based on user role
    if (userRole === 'water-admin') {
      setAdvisories([...waterAdvisories]);
    } else if (userRole === 'energy-admin') {
      setAdvisories([...energyAdvisories]);
    } else if (userRole === 'super-admin') {
      setAdvisories([...waterAdvisories, ...energyAdvisories]);
    } else {
      // For citizens, show a mix of advisories most relevant to them
      setAdvisories([...waterAdvisories.slice(0, 3), ...energyAdvisories.slice(0, 3)]);
    }
  };

  const generateWaterAdvisories = () => {
    // Analyze water-related complaints to generate relevant advisories
    const waterComplaints = complaints.filter(c => c.category === 'water');
    const highPriorityCount = waterComplaints.filter(c => c.priority === 'high').length;
    const lowPressureCount = waterComplaints.filter(c => c.content.toLowerCase().includes('pressure')).length;
    const qualityIssueCount = waterComplaints.filter(c => 
      c.content.toLowerCase().includes('quality') || 
      c.content.toLowerCase().includes('contamination') ||
      c.content.toLowerCase().includes('dirty')
    ).length;
    
    const currentMonth = new Date().getMonth();
    const isWaterScarcitySeason = currentMonth >= 2 && currentMonth <= 5; // March to June

    const advisories = [
      {
        title: isWaterScarcitySeason ? "Seasonal Low Pressure Alert" : "Water Conservation Reminder",
        description: isWaterScarcitySeason 
          ? "Based on seasonal patterns, water supply pressure may be reduced during summer months. Consider storing water and reporting any leakages promptly."
          : "Current water usage is approaching seasonal averages. To optimize resources, consider using washing machines with full loads only and fixing any leaking taps.",
        category: "water",
        severity: isWaterScarcitySeason ? "medium" : "low",
        icon: <Droplet className="h-5 w-5 text-blue-600" />,
        date: new Date().toISOString()
      }
    ];

    // Add additional advisories based on complaint patterns
    if (highPriorityCount > 5) {
      advisories.push({
        title: "Increase in Critical Water Issues",
        description: `There has been a significant increase in high-priority water-related issues. Municipal teams are working to address these concerns with priority.`,
        category: "water",
        severity: "high",
        icon: <Droplet className="h-5 w-5 text-blue-600" />,
        date: new Date().toISOString()
      });
    }

    if (lowPressureCount > 3) {
      advisories.push({
        title: "Water Pressure Management Notice",
        description: "Multiple reports of low water pressure have been received. Engineers are investigating the water distribution network. Consider storing water during supply hours as a precaution.",
        category: "water",
        severity: "medium",
        icon: <Droplet className="h-5 w-5 text-blue-600" />,
        date: new Date().toISOString()
      });
    }

    if (qualityIssueCount > 0) {
      advisories.push({
        title: "Water Quality Monitoring Update",
        description: "Some reports of water quality concerns have been received. Water testing teams are conducting additional tests. As a precaution, consider boiling water for drinking purposes.",
        category: "water",
        severity: "medium",
        icon: <Droplet className="h-5 w-5 text-blue-600" />,
        date: new Date().toISOString()
      });
    }

    // Add seasonal advisory
    if (currentMonth >= 5 && currentMonth <= 8) { // June to September (monsoon)
      advisories.push({
        title: "Monsoon Water Management",
        description: "During monsoon season, water may appear slightly cloudy due to increased turbidity. Our treatment plants are operating at enhanced capacity to maintain quality standards.",
        category: "water",
        severity: "low",
        icon: <Droplet className="h-5 w-5 text-blue-600" />,
        date: new Date().toISOString()
      });
    }

    return advisories;
  };

  const generateEnergyAdvisories = () => {
    // Analyze energy-related complaints to generate relevant advisories
    const energyComplaints = complaints.filter(c => c.category === 'energy');
    const outageCount = energyComplaints.filter(c => 
      c.content.toLowerCase().includes('outage') || 
      c.content.toLowerCase().includes('no power') ||
      c.content.toLowerCase().includes('power cut')
    ).length;
    const fluctuationCount = energyComplaints.filter(c => 
      c.content.toLowerCase().includes('fluctuation') || 
      c.content.toLowerCase().includes('voltage')
    ).length;
    
    const currentMonth = new Date().getMonth();
    const isSummerPeakSeason = currentMonth >= 3 && currentMonth <= 6; // April to July

    const advisories = [
      {
        title: isSummerPeakSeason ? "Peak Load Warning" : "Energy Conservation Tips",
        description: isSummerPeakSeason
          ? "Energy demand is expected to peak between 6-10 PM. To prevent outages, minimize usage of high-consumption appliances during these hours."
          : "Setting your AC temperature to 24°C instead of 22°C can reduce your power consumption by up to 10% while maintaining comfort.",
        category: "energy",
        severity: isSummerPeakSeason ? "medium" : "low",
        icon: <Zap className="h-5 w-5 text-yellow-600" />,
        date: new Date().toISOString()
      }
    ];

    // Add additional advisories based on complaint patterns
    if (outageCount > 3) {
      advisories.push({
        title: "Power Distribution Update",
        description: "We've noticed an increase in power outage reports. Our teams are working to improve grid stability. Consider keeping emergency lights charged as a precaution.",
        category: "energy",
        severity: "high",
        icon: <Zap className="h-5 w-5 text-yellow-600" />,
        date: new Date().toISOString()
      });
    }

    if (fluctuationCount > 2) {
      advisories.push({
        title: "Voltage Stabilization Notice",
        description: "Reports of power fluctuations have increased in some areas. Consider using voltage stabilizers for sensitive electronic equipment until our grid enhancement is complete.",
        category: "energy",
        severity: "medium",
        icon: <Zap className="h-5 w-5 text-yellow-600" />,
        date: new Date().toISOString()
      });
    }

    // Add seasonal advisory
    if (currentMonth >= 5 && currentMonth <= 8) { // June to September (monsoon)
      advisories.push({
        title: "Monsoon Electrical Safety",
        description: "During monsoon season, be extra cautious with electrical equipment. Avoid using electrical appliances during thunderstorms and check for water leakage near electrical points.",
        category: "energy",
        severity: "medium",
        icon: <Zap className="h-5 w-5 text-yellow-600" />,
        date: new Date().toISOString()
      });
    }

    return advisories;
  };

  // Helper function to get severity class
  const getSeverityClass = (severity: string) => {
    switch(severity) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'medium':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-950/20';
      case 'low':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  // Helper function to get severity text color
  const getSeverityTextColor = (severity: string) => {
    switch(severity) {
      case 'high':
        return 'text-red-700 dark:text-red-400';
      case 'medium':
        return 'text-orange-700 dark:text-orange-400';
      case 'low':
        return 'text-green-700 dark:text-green-400';
      default:
        return 'text-gray-700 dark:text-gray-400';
    }
  };

  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'water':
        return <Droplet className="h-5 w-5 text-blue-600" />;
      case 'energy':
        return <Zap className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading advisories...</p>
        </div>
      </MainLayout>
    );
  }

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
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-amber-500" />
              PCMC Advisories
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Important notices and recommendations based on real-time resource monitoring and complaint analytics.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/water">
                <Droplet className="h-4 w-4" />
                <span className="hidden sm:inline">Water Resources</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link to="/energy">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Energy Resources</span>
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Current Advisories</span>
            </TabsTrigger>
            <TabsTrigger value="water" className="flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              <span>Water</span>
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Energy</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {advisories.length > 0 ? (
                  advisories.map((advisory, index) => (
                    <Card key={index} className={`${getSeverityClass(advisory.severity)}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {advisory.icon}
                            <CardTitle className={`text-lg ${getSeverityTextColor(advisory.severity)}`}>
                              {advisory.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium uppercase px-2 py-1 rounded-full bg-black/5 dark:bg-white/10">
                            {advisory.category === 'water' ? (
                              <Droplet className="h-3 w-3 text-blue-600" />
                            ) : (
                              <Zap className="h-3 w-3 text-yellow-600" />
                            )}
                            <span>{advisory.category}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className={`${getSeverityTextColor(advisory.severity)}`}>{advisory.description}</p>
                        
                        {advisory.severity === 'high' && (
                          <div className="mt-4 flex items-center justify-end">
                            <Button variant="outline" size="sm" asChild className="gap-2">
                              <Link to={advisory.category === 'water' ? '/water' : '/energy'}>
                                <LinkIcon className="h-3 w-3" />
                                <span>More Information</span>
                              </Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Info className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No active advisories</h3>
                        <p className="text-muted-foreground mt-1 max-w-md">
                          There are currently no active advisories for your area. Check back later for updates.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="water">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {advisories.filter(a => a.category === 'water').length > 0 ? (
                  advisories
                    .filter(a => a.category === 'water')
                    .map((advisory, index) => (
                      <Card key={index} className={`${getSeverityClass(advisory.severity)}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {advisory.icon}
                              <CardTitle className={`text-lg ${getSeverityTextColor(advisory.severity)}`}>
                                {advisory.title}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium uppercase px-2 py-1 rounded-full bg-black/5 dark:bg-white/10">
                              <Droplet className="h-3 w-3 text-blue-600" />
                              <span>water</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className={`${getSeverityTextColor(advisory.severity)}`}>{advisory.description}</p>
                          
                          {advisory.severity === 'high' && (
                            <div className="mt-4 flex items-center justify-end">
                              <Button variant="outline" size="sm" asChild className="gap-2">
                                <Link to="/water">
                                  <LinkIcon className="h-3 w-3" />
                                  <span>More Information</span>
                                </Link>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Droplet className="h-12 w-12 text-blue-300 mb-4" />
                        <h3 className="text-lg font-medium">No water advisories</h3>
                        <p className="text-muted-foreground mt-1 max-w-md">
                          There are currently no active water advisories for your area.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Water Conservation Tips</CardTitle>
                  <CardDescription>Simple ways to save water in your daily life</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Fix leaking taps</h4>
                        <p className="text-sm text-muted-foreground">A dripping tap can waste up to 15 liters per day. Fix leaking taps promptly.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Use water-efficient fixtures</h4>
                        <p className="text-sm text-muted-foreground">Install low-flow showerheads and dual-flush toilets to reduce water consumption.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Harvest rainwater</h4>
                        <p className="text-sm text-muted-foreground">Collect rainwater for gardening and cleaning purposes.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Full loads only</h4>
                        <p className="text-sm text-muted-foreground">Run washing machines and dishwashers only when fully loaded.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="energy">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {advisories.filter(a => a.category === 'energy').length > 0 ? (
                  advisories
                    .filter(a => a.category === 'energy')
                    .map((advisory, index) => (
                      <Card key={index} className={`${getSeverityClass(advisory.severity)}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {advisory.icon}
                              <CardTitle className={`text-lg ${getSeverityTextColor(advisory.severity)}`}>
                                {advisory.title}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium uppercase px-2 py-1 rounded-full bg-black/5 dark:bg-white/10">
                              <Zap className="h-3 w-3 text-yellow-600" />
                              <span>energy</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className={`${getSeverityTextColor(advisory.severity)}`}>{advisory.description}</p>
                          
                          {advisory.severity === 'high' && (
                            <div className="mt-4 flex items-center justify-end">
                              <Button variant="outline" size="sm" asChild className="gap-2">
                                <Link to="/energy">
                                  <LinkIcon className="h-3 w-3" />
                                  <span>More Information</span>
                                </Link>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Zap className="h-12 w-12 text-yellow-300 mb-4" />
                        <h3 className="text-lg font-medium">No energy advisories</h3>
                        <p className="text-muted-foreground mt-1 max-w-md">
                          There are currently no active energy advisories for your area.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Energy Saving Tips</CardTitle>
                  <CardDescription>Ways to reduce electricity consumption</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <span className="font-medium text-yellow-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Optimal AC temperature</h4>
                        <p className="text-sm text-muted-foreground">Set your AC to 24-26°C for optimal energy efficiency without sacrificing comfort.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <span className="font-medium text-yellow-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">LED lighting</h4>
                        <p className="text-sm text-muted-foreground">Replace incandescent bulbs with LED lights to save up to 80% on lighting costs.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <span className="font-medium text-yellow-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Unplug devices</h4>
                        <p className="text-sm text-muted-foreground">Unplug electronics and appliances when not in use to eliminate standby power consumption.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <span className="font-medium text-yellow-600">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Peak hour usage</h4>
                        <p className="text-sm text-muted-foreground">Avoid running high-power appliances during peak hours (6-10 PM).</p>
                      </div>
                    </div>
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

export default Advisory;
