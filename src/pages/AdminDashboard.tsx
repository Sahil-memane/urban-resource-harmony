
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MessageSquare, CheckCircle } from 'lucide-react';
import AdminComplaintsList from '@/components/complaints/AdminComplaintsList';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

type Complaint = {
  id: string;
  category: string;
  priority: string;
  content: string;
  source: string;
  status: string;
  date: string;
  user_id: string;
  response?: string;
  resolved_date?: string;
  resolved_by?: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingComplaints, setPendingComplaints] = useState<Complaint[]>([]);
  const [resolvedComplaints, setResolvedComplaints] = useState<Complaint[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Fetch complaints
  const fetchComplaints = async () => {
    if (!userRole || userRole === 'citizen') return;

    try {
      setIsDataLoading(true);

      // Fetch pending complaints
      const { data: pendingData, error: pendingError } = await supabase
        .from('complaints')
        .select('*')
        .eq('status', 'pending')
        .order('date', { ascending: false });

      if (pendingError) throw pendingError;

      // Fetch resolved complaints
      const { data: resolvedData, error: resolvedError } = await supabase
        .from('complaints')
        .select('*')
        .eq('status', 'resolved')
        .order('resolved_date', { ascending: false });

      if (resolvedError) throw resolvedError;

      setPendingComplaints(pendingData || []);
      setResolvedComplaints(resolvedData || []);
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Handle resolve complaint
  const handleResolveComplaint = async (id: string, response: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('User session expired. Please login again.');
        return;
      }

      const { error } = await supabase
        .from('complaints')
        .update({
          status: 'resolved',
          response,
          resolved_date: new Date().toISOString(),
          resolved_by: user.id
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedComplaint = pendingComplaints.find(c => c.id === id);
      if (updatedComplaint) {
        const resolvedComplaint = {
          ...updatedComplaint,
          status: 'resolved',
          response,
          resolved_date: new Date().toISOString(),
          resolved_by: user.id
        };

        setPendingComplaints(prev => prev.filter(c => c.id !== id));
        setResolvedComplaints(prev => [resolvedComplaint, ...prev]);
      }

      toast.success('Complaint resolved successfully');
    } catch (error: any) {
      console.error('Error resolving complaint:', error);
      toast.error('Failed to resolve complaint');
    }
  };

  // Check if user is admin and fetch complaints when role is available
  useEffect(() => {
    if (!isLoading) {
      if (userRole === 'citizen') {
        toast.error('You do not have permission to access the admin dashboard');
        navigate('/');
      } else if (userRole) {
        fetchComplaints();
      }
    }
  }, [userRole, isLoading, navigate]);

  // Refresh complaints when tab changes
  useEffect(() => {
    if (userRole && userRole !== 'citizen') {
      fetchComplaints();
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  // Render only if admin
  if (userRole && userRole !== 'citizen') {
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto py-8 px-4 md:px-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                {userRole === 'water-admin' ? 'Water Department Admin Panel' : 
                 userRole === 'energy-admin' ? 'Energy Department Admin Panel' : 
                 'Super Admin Panel'}
              </p>
            </div>
            
            <Badge className="mt-2 md:mt-0 capitalize text-md bg-blue-600 hover:bg-blue-700">
              {userRole}
            </Badge>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Complaints Management</CardTitle>
              <CardDescription>
                Review and respond to public complaints related to {userRole === 'water-admin' ? 'water supply' : userRole === 'energy-admin' ? 'energy services' : 'all services'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>Pending Complaints</span>
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Resolved Complaints</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  {isDataLoading ? (
                    <div className="text-center py-8">
                      <p>Loading complaints...</p>
                    </div>
                  ) : pendingComplaints.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No pending complaints</p>
                    </div>
                  ) : (
                    <AdminComplaintsList 
                      complaints={pendingComplaints} 
                      onResolve={handleResolveComplaint}
                      isResolved={false}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="resolved">
                  {isDataLoading ? (
                    <div className="text-center py-8">
                      <p>Loading complaints...</p>
                    </div>
                  ) : resolvedComplaints.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No resolved complaints</p>
                    </div>
                  ) : (
                    <AdminComplaintsList 
                      complaints={resolvedComplaints} 
                      isResolved={true}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </MainLayout>
    );
  }

  return null;
};

export default AdminDashboard;
