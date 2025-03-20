
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Droplet, 
  Zap, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  Lightbulb, 
  Clock,
  CloudRain,
  Sun,
  Thermometer,
  CalendarDays,
  Download,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Advisory = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [waterAdvisory, setWaterAdvisory] = useState<any>(null);
  const [energyAdvisory, setEnergyAdvisory] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('water');
  const { userRole } = useUserRole();
  const [currentSeason, setCurrentSeason] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAdvisoryData();
    determineCurrentSeason();
  }, []);
  
  const determineCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) {
      setCurrentSeason('Summer');
    } else if (month >= 6 && month <= 8) {
      setCurrentSeason('Monsoon');
    } else if (month >= 9 && month <= 11) {
      setCurrentSeason('Autumn');
    } else {
      setCurrentSeason('Winter');
    }
  };

  const fetchAdvisoryData = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      if (forceRefresh) {
        setIsRefreshing(true);
      }

      // First try to fetch from the Python server via the Edge Function
      try {
        console.log('Fetching advisory data from server...');
        
        const waterResponse = await supabase.functions.invoke('python-bridge', {
          body: { 
            endpoint: 'fetch_resource_data',
            data: { resourceType: 'water', forceRefresh }
          }
        });
        
        const energyResponse = await supabase.functions.invoke('python-bridge', {
          body: { 
            endpoint: 'fetch_resource_data',
            data: { resourceType: 'energy', forceRefresh }
          }
        });
        
        if (waterResponse.data?.data) {
          console.log('Water advisory data:', waterResponse.data.data.waterAdvisory);
          setWaterAdvisory(waterResponse.data.data.waterAdvisory);
        }
        
        if (energyResponse.data?.data) {
          console.log('Energy advisory data:', energyResponse.data.data.energyAdvisory);
          setEnergyAdvisory(energyResponse.data.data.energyAdvisory);
        }
        
        if (!waterResponse.data?.data && !energyResponse.data?.data) {
          throw new Error('No data received from server');
        }

      } catch (error) {
        console.error('Error fetching advisory data:', error);
        
        // Fallback to static advisory data
        setWaterAdvisory(getStaticWaterAdvisory());
        setEnergyAdvisory(getStaticEnergyAdvisory());
        
        toast.error('Could not fetch live advisory data, showing static recommendations');
      }

    } catch (error) {
      console.error('Error in fetchAdvisoryData:', error);
      toast.error('Failed to load advisory information');
      
      // Set static data as fallback
      setWaterAdvisory(getStaticWaterAdvisory());
      setEnergyAdvisory(getStaticEnergyAdvisory());
      
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStaticWaterAdvisory = () => {
    // Fallback static water advisory
    return {
      quality: "Regular monitoring of water quality parameters continues. PCMC maintains standards within WHO guidelines.",
      conservation: "Practice water conservation by fixing leaks and using water-efficient appliances. Every drop saved helps the community.",
      seasonal: `${currentSeason} typically requires additional water management. Check PCMC notifications for scheduled supply timings.`,
      actions: [
        "Report leakages immediately through the complaint portal",
        "Store water adequately during supply hours in clean containers",
        "Install water-efficient fixtures to reduce consumption by up to 20%",
        "Harvest rainwater where possible to supplement supply and recharge groundwater"
      ]
    };
  };

  const getStaticEnergyAdvisory = () => {
    // Fallback static energy advisory
    return {
      consumption: "Monitor your energy consumption by checking your meter regularly. MSEDCL smart meters are being rolled out across PCMC.",
      efficiency: "Use energy-efficient appliances and LED lighting to reduce consumption. PCMC offers rebates for energy-star rated appliances.",
      seasonal: `${currentSeason} energy demand patterns require careful management. Avoid heavy appliance usage during peak hours (6-10 PM).`,
      actions: [
        "Avoid using heavy appliances during peak hours (6-10 PM)",
        "Use natural light during daytime where possible",
        "Maintain appliances regularly for optimal efficiency",
        "Consider solar solutions to reduce dependency on grid electricity"
      ]
    };
  };

  const handleRefresh = () => {
    fetchAdvisoryData(true);
    toast.success('Refreshing advisory data...');
  };

  const getSeasonalIcon = () => {
    switch (currentSeason) {
      case 'Summer':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'Monsoon':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'Winter':
        return <Thermometer className="h-5 w-5 text-blue-300" />;
      case 'Autumn':
        return <CalendarDays className="h-5 w-5 text-amber-500" />;
      default:
        return <CalendarDays className="h-5 w-5" />;
    }
  };

  const renderWaterAdvisory = () => {
    if (!waterAdvisory) return null;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
                Current Water Advisory
              </CardTitle>
              <CardDescription>
                Updated {new Date().toLocaleDateString()}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-400">Water Quality</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                {waterAdvisory.quality}
              </AlertDescription>
            </Alert>
            
            <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
              <Droplet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle className="text-emerald-800 dark:text-emerald-400">Conservation</AlertTitle>
              <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                {waterAdvisory.conservation}
              </AlertDescription>
            </Alert>
            
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              {getSeasonalIcon()}
              <AlertTitle className="text-amber-800 dark:text-amber-400">Seasonal Advisory</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                {waterAdvisory.seasonal}
              </AlertDescription>
            </Alert>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Recommended Actions</h4>
              <ul className="space-y-2">
                {waterAdvisory.actions.map((action: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => navigate('/water')}>
              View Water Analytics
            </Button>
            <Button variant="outline" onClick={() => navigate('/complaints')}>
              Report Water Issue
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>PCMC Water Resources</CardTitle>
            <CardDescription>Key information about water supply in Pimpri Chinchwad</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Water Sources</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">The primary source of water for PCMC is the Pavana Dam, located approximately 35km from the city.</p>
                  <p>Additional water is sourced from groundwater and the Indrayani River during peak demand periods.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Supply Schedule</AccordionTrigger>
                <AccordionContent>
                  <p>Water supply in PCMC typically follows a zonal distribution system with most areas receiving water for 4-6 hours daily.</p>
                  <p className="mt-2">During summer months (April-May), supply hours may be reduced due to increased demand and lower reservoir levels.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Conservation Initiatives</AccordionTrigger>
                <AccordionContent>
                  <p>PCMC has implemented several water conservation initiatives including:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Rainwater harvesting requirements for new buildings</li>
                    <li>Smart water meters for monitoring consumption</li>
                    <li>Leak detection and repair programs</li>
                    <li>Treated wastewater reuse for non-potable purposes</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEnergyAdvisory = () => {
    if (!energyAdvisory) return null;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Current Energy Advisory
              </CardTitle>
              <CardDescription>
                Updated {new Date().toLocaleDateString()}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
              <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-400">Energy Consumption</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                {energyAdvisory.consumption}
              </AlertDescription>
            </Alert>
            
            <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
              <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <AlertTitle className="text-purple-800 dark:text-purple-400">Efficiency Tips</AlertTitle>
              <AlertDescription className="text-purple-700 dark:text-purple-400">
                {energyAdvisory.efficiency}
              </AlertDescription>
            </Alert>
            
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              {getSeasonalIcon()}
              <AlertTitle className="text-amber-800 dark:text-amber-400">Seasonal Advisory</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                {energyAdvisory.seasonal}
              </AlertDescription>
            </Alert>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Recommended Actions</h4>
              <ul className="space-y-2">
                {energyAdvisory.actions.map((action: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => navigate('/energy')}>
              View Energy Analytics
            </Button>
            <Button variant="outline" onClick={() => navigate('/complaints')}>
              Report Energy Issue
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>PCMC Energy Resources</CardTitle>
            <CardDescription>Key information about power supply in Pimpri Chinchwad</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Power Distribution</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Electricity in PCMC is distributed by MSEDCL (Maharashtra State Electricity Distribution Company Limited).</p>
                  <p>The area receives power from multiple substations connected to the state grid, with some industrial areas having dedicated feeders.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Peak Hours</AccordionTrigger>
                <AccordionContent>
                  <p>Peak demand hours typically occur between 6-10 PM when residential consumption is highest.</p>
                  <p className="mt-2">During summer months, additional afternoon peaks (1-4 PM) may occur due to cooling requirements.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Energy Initiatives</AccordionTrigger>
                <AccordionContent>
                  <p>PCMC has implemented several energy initiatives including:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>LED streetlight conversion program</li>
                    <li>Solar power installations on municipal buildings</li>
                    <li>Time-of-day metering to incentivize off-peak usage</li>
                    <li>Subsidies for energy-efficient appliances</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
              Current advisories and recommendations for efficient resource usage
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
            <span>Refresh</span>
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
            {renderWaterAdvisory()}
          </TabsContent>
          
          <TabsContent value="energy">
            {renderEnergyAdvisory()}
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default Advisory;
