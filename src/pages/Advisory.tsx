
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Droplet, 
  Zap, 
  AlertTriangle, 
  Lightbulb,
  Info,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Advisory = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [advisoryData, setAdvisoryData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('water');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAdvisoryData();
  }, []);

  const fetchAdvisoryData = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      if (forceRefresh) {
        setIsRefreshing(true);
      }

      // Try to fetch from the Python server via the Edge Function
      try {
        console.log('Fetching advisory data from server...');
        
        const { data, error } = await supabase.functions.invoke('python-bridge', {
          body: { 
            endpoint: 'fetch_advisory_data',
            data: { forceRefresh }
          }
        });
        
        if (error) {
          throw error;
        }
        
        if (data?.data) {
          console.log('Advisory data:', data.data);
          setAdvisoryData(data.data);
          toast.success('Advisory data updated successfully');
        } else {
          throw new Error('No data received from server');
        }

      } catch (error) {
        console.error('Error fetching advisory data:', error);
        
        // Fallback to mock data
        const mockData = generateMockAdvisoryData();
        setAdvisoryData(mockData);
        
        toast.error('Could not fetch live advisory data, showing sample data');
      }

    } catch (error) {
      console.error('Error in fetchAdvisoryData:', error);
      toast.error('Failed to load advisory information');
      
      // Set mock data as fallback
      setAdvisoryData(generateMockAdvisoryData());
      
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAdvisoryData(true);
    toast.success('Refreshing advisory data...');
  };

  const generateMockAdvisoryData = () => {
    // Create mock advisory data for both water and energy
    return {
      water: {
        current: [
          {
            id: 1,
            title: "Summer Conservation Advisory",
            category: "conservation",
            severity: "medium",
            content: "Based on seasonal patterns, water supply pressure may be reduced during April-May. Consider storing water and reporting any leakages promptly. Residents are advised to use water judiciously during peak summer.",
            date: "2024-05-01",
            expires: "2024-06-15"
          },
          {
            id: 2,
            title: "Water Quality Notice",
            category: "quality",
            severity: "low",
            content: "Recent testing shows increased turbidity levels in some areas of Pimpri. While water remains safe for consumption, residents may notice slight discoloration. Running taps for 30 seconds before use is recommended.",
            date: "2024-05-10",
            expires: "2024-05-25"
          },
          {
            id: 3,
            title: "Pipeline Maintenance Alert",
            category: "maintenance",
            severity: "medium",
            content: "Scheduled maintenance of the main pipeline from Pavana Dam will affect water supply in sectors 23-28 on May 20th. Supply will be limited to 2 hours (6-8 AM) instead of the regular schedule. Please store water accordingly.",
            date: "2024-05-15",
            expires: "2024-05-21"
          }
        ],
        seasonal: {
          summer: "Water demand typically increases by 30% during April-June. Install water-efficient fixtures to reduce consumption. Consider rainwater harvesting systems before monsoon starts.",
          monsoon: "During monsoon season, water quality may be affected due to increased turbidity. Use additional filtration and report any discoloration immediately.",
          winter: "Winter is ideal for maintenance of water storage systems. Check for leaks in home plumbing and fix them to prevent water wastage.",
          autumn: "Post-monsoon is a good time to clean water tanks and storage units to prevent contamination."
        },
        tips: [
          "Fix leaking taps - a dripping tap can waste up to 20,000 liters annually",
          "Use bucket instead of shower when possible - saves up to 80% water",
          "Install dual-flush toilets to reduce water consumption",
          "Water plants during early morning or evening to reduce evaporation",
          "Reuse RO reject water for cleaning or gardening"
        ]
      },
      energy: {
        current: [
          {
            id: 1,
            title: "Peak Load Management Advisory",
            category: "load",
            severity: "high",
            content: "Energy demand is expected to peak during summer months. Minimize usage during 6-10 PM to avoid potential outages and higher tariffs. Industries are requested to optimize their energy-intensive operations outside peak hours.",
            date: "2024-05-01",
            expires: "2024-06-30"
          },
          {
            id: 2,
            title: "Scheduled Maintenance Outage",
            category: "maintenance",
            severity: "medium",
            content: "MSEDCL will conduct preventive maintenance on the Chinchwad substation on May 25th. Areas affected include Sectors 18-22, with planned outage from 10 AM to 2 PM. Please plan accordingly.",
            date: "2024-05-18",
            expires: "2024-05-26"
          },
          {
            id: 3,
            title: "Solar Subsidy Program",
            category: "sustainability",
            severity: "low",
            content: "PCMC has announced additional subsidies for rooftop solar installations. Residential buildings can avail up to 40% subsidy for systems installed before September 2024. Apply through the PCMC Energy portal.",
            date: "2024-05-10",
            expires: "2024-09-30"
          }
        ],
        seasonal: {
          summer: "Energy consumption increases 40-60% during summer months due to cooling needs. Set ACs to 24-26°C and use fans in conjunction to reduce load.",
          monsoon: "During monsoon, risk of electrical hazards increases. Ensure proper insulation and earthing of electrical systems.",
          winter: "Winter sees reduced solar generation. If you have solar panels, adjust your consumption patterns accordingly.",
          autumn: "Autumn is ideal for electrical system maintenance. Schedule inspections for inverters, generators and main supply lines."
        },
        tips: [
          "Replace conventional lights with LEDs - saves up to 80% energy",
          "Use star-rated appliances to reduce electricity consumption",
          "Set refrigerator temperature to 4-5°C for optimal efficiency",
          "Use power strips to eliminate phantom loads from devices",
          "Consider time-of-day usage to avoid peak tariffs (typically 6-10 PM)"
        ]
      }
    };
  };

  const renderWaterAdvisoryTab = () => {
    if (!advisoryData?.water) return null;
    const { current, seasonal, tips } = advisoryData.water;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Droplet className="h-6 w-6 text-blue-500" />
          <span>Current Water Advisories</span>
        </h2>
        
        {current.map((advisory: any) => (
          <Card key={advisory.id} className={`
            ${advisory.severity === 'high' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : 
              advisory.severity === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' : 
              'border-blue-200 bg-blue-50 dark:bg-blue-950/20'}
          `}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {advisory.severity === 'high' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : advisory.severity === 'medium' ? (
                    <Info className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  )}
                  <CardTitle className={`
                    ${advisory.severity === 'high' ? 'text-red-800 dark:text-red-400' : 
                      advisory.severity === 'medium' ? 'text-yellow-800 dark:text-yellow-400' : 
                      'text-blue-800 dark:text-blue-400'}
                  `}>
                    {advisory.title}
                  </CardTitle>
                </div>
                <div className="text-sm text-muted-foreground">
                  Valid until: {advisory.expires}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`
                ${advisory.severity === 'high' ? 'text-red-800 dark:text-red-400' : 
                  advisory.severity === 'medium' ? 'text-yellow-800 dark:text-yellow-400' : 
                  'text-blue-800 dark:text-blue-400'}
              `}>
                {advisory.content}
              </p>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Seasonal Water Recommendations</CardTitle>
            <CardDescription>Advice based on seasonal water patterns in PCMC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Summer (Mar-Jun)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{seasonal.summer}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Monsoon (Jul-Sep)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{seasonal.monsoon}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Autumn (Oct-Nov)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{seasonal.autumn}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Winter (Dec-Feb)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{seasonal.winter}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Water Conservation Tips</CardTitle>
            <CardDescription>Simple steps to reduce water consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEnergyAdvisoryTab = () => {
    if (!advisoryData?.energy) return null;
    const { current, seasonal, tips } = advisoryData.energy;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          <span>Current Energy Advisories</span>
        </h2>
        
        {current.map((advisory: any) => (
          <Card key={advisory.id} className={`
            ${advisory.severity === 'high' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : 
              advisory.severity === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' : 
              'border-green-200 bg-green-50 dark:bg-green-950/20'}
          `}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {advisory.severity === 'high' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : advisory.severity === 'medium' ? (
                    <Info className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <Lightbulb className="h-5 w-5 text-green-600" />
                  )}
                  <CardTitle className={`
                    ${advisory.severity === 'high' ? 'text-red-800 dark:text-red-400' : 
                      advisory.severity === 'medium' ? 'text-yellow-800 dark:text-yellow-400' : 
                      'text-green-800 dark:text-green-400'}
                  `}>
                    {advisory.title}
                  </CardTitle>
                </div>
                <div className="text-sm text-muted-foreground">
                  Valid until: {advisory.expires}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`
                ${advisory.severity === 'high' ? 'text-red-800 dark:text-red-400' : 
                  advisory.severity === 'medium' ? 'text-yellow-800 dark:text-yellow-400' : 
                  'text-green-800 dark:text-green-400'}
              `}>
                {advisory.content}
              </p>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Seasonal Energy Recommendations</CardTitle>
            <CardDescription>Advice based on seasonal energy patterns in PCMC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Summer (Mar-Jun)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{seasonal.summer}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Monsoon (Jul-Sep)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{seasonal.monsoon}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Autumn (Oct-Nov)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{seasonal.autumn}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Winter (Dec-Feb)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{seasonal.winter}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Energy Conservation Tips</CardTitle>
            <CardDescription>Simple steps to reduce energy consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading advisory information...</p>
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
            <h1 className="text-3xl font-bold mb-2">PCMC Resource Advisory</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Current advisories, seasonal recommendations, and conservation tips for water and energy resources
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Refresh Data</span>
          </Button>
        </div>

        <Tabs defaultValue="water" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="water" className="flex items-center gap-2">
              <Droplet size={16} />
              <span>Water Advisory</span>
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-2">
              <Zap size={16} />
              <span>Energy Advisory</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="water">
            {renderWaterAdvisoryTab()}
          </TabsContent>
          
          <TabsContent value="energy">
            {renderEnergyAdvisoryTab()}
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default Advisory;
