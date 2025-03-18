
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ComplaintsAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [charts, setCharts] = useState<{
    categoryChart: string;
    priorityChart: string;
    trendsChart: string;
    resolutionChart: string;
  } | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (complaints.length > 0) {
      generateAnalytics();
    }
  }, [complaints]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        console.log("Fetched complaints for analytics:", data.length);
        setComplaints(data);
      }
    } catch (error) {
      console.error('Error fetching complaints for analytics:', error);
      toast.error('Failed to load complaints data for analytics');
    }
  };

  const generateAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // First try the Python backend
      try {
        const { data, error } = await supabase.functions.invoke('python-bridge', {
          body: { 
            endpoint: 'generate_analytics',
            data: { complaints }
          }
        });
        
        if (error) throw error;
        
        if (data) {
          console.log("Analytics generated successfully from Python backend");
          setCharts(data);
          setIsLoading(false);
          return;
        }
      } catch (pythonError) {
        console.warn('Python backend not available, falling back to default charts:', pythonError);
        // Fall back to default charts if Python backend is not available
      }
      
      // Fallback to default charts
      setCharts({
        categoryChart: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIyNTAiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyMCI+UmVhbC1kYXRhIGNoYXJ0cyB3aWxsIGFwcGVhciBoZXJlPC90ZXh0Pjwvc3ZnPg==",
        priorityChart: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIyNTAiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyMCI+UmVhbC1kYXRhIGNoYXJ0cyB3aWxsIGFwcGVhciBoZXJlPC90ZXh0Pjwvc3ZnPg==",
        trendsChart: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIyNTAiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyMCI+UmVhbC1kYXRhIGNoYXJ0cyB3aWxsIGFwcGVhciBoZXJlPC90ZXh0Pjwvc3ZnPg==",
        resolutionChart: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIyNTAiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyMCI+UmVhbC1kYXRhIGNoYXJ0cyB3aWxsIGFwcGVhciBoZXJlPC90ZXh0Pjwvc3ZnPg=="
      });
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast.error('Failed to generate analytics charts');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading analytics...</p>
      </div>
    );
  }

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
            <div className="h-[300px] flex items-center justify-center">
              {charts?.categoryChart ? (
                <img src={charts.categoryChart} alt="Complaints by Category" className="max-h-[280px] object-contain mx-auto" />
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
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
            <div className="h-[300px] flex items-center justify-center">
              {charts?.priorityChart ? (
                <img src={charts.priorityChart} alt="Complaints by Priority" className="max-h-[280px] object-contain mx-auto" />
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Complaint Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {charts?.trendsChart ? (
              <img src={charts.trendsChart} alt="Monthly Complaint Trends" className="max-h-[280px] object-contain mx-auto" />
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Resolution Time (Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {charts?.resolutionChart ? (
              <img src={charts.resolutionChart} alt="Average Resolution Time" className="max-h-[280px] object-contain mx-auto" />
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintsAnalytics;
