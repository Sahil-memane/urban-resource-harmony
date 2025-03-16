
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MessageSquare, Mic, FileImage, Droplet, Zap, CheckCircle } from 'lucide-react';
import AdminComplaintsList from '@/components/complaints/AdminComplaintsList';
import { useUserRole } from '@/hooks/useUserRole';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState('pending');
  
  // Mock data for demonstration - would come from Supabase in production
  const [pendingComplaints, setPendingComplaints] = useState([
    { id: 1, category: 'water', priority: 'high', content: 'Water supply has been irregular for the past week', source: 'text', status: 'pending', date: '2023-06-15', userId: 'user1' },
    { id: 2, category: 'energy', priority: 'medium', content: 'Frequent power cuts in the evening hours', source: 'text', status: 'pending', date: '2023-06-16', userId: 'user2' },
    { id: 3, category: 'water', priority: 'low', content: 'Water pressure is very low in our area', source: 'voice', status: 'pending', date: '2023-06-10', userId: 'user3' },
  ]);
  
  const [resolvedComplaints, setResolvedComplaints] = useState([
    { id: 4, category: 'water', priority: 'medium', content: 'No water supply yesterday', source: 'text', status: 'resolved', date: '2023-06-05', userId: 'user4', response: 'Issue resolved - water supply restored', resolvedDate: '2023-06-07' },
    { id: 5, category: 'energy', priority: 'high', content: 'Power fluctuations causing damage to appliances', source: 'image', status: 'resolved', date: '2023-06-08', userId: 'user5', response: 'Transformer stabilized, fluctuations fixed', resolvedDate: '2023-06-09' },
  ]);

  // Filter complaints based on admin role (water or energy)
  const filteredPendingComplaints = pendingComplaints.filter(complaint => {
    if (userRole === 'water-admin') return complaint.category === 'water';
    if (userRole === 'energy-admin') return complaint.category === 'energy';
    return true; // Super admin sees all
  });
  
  const filteredResolvedComplaints = resolvedComplaints.filter(complaint => {
    if (userRole === 'water-admin') return complaint.category === 'water';
    if (userRole === 'energy-admin') return complaint.category === 'energy';
    return true; // Super admin sees all
  });

  useEffect(() => {
    // Redirect if not admin
    if (!isLoading && userRole === 'citizen') {
      toast.error('You do not have permission to access the admin dashboard');
      navigate('/');
    }
  }, [userRole, isLoading, navigate]);

  const handleResolveComplaint = (id: number, response: string) => {
    // In production, this would update the record in Supabase
    const complaintToResolve = pendingComplaints.find(c => c.id === id);
    if (complaintToResolve) {
      // Remove from pending
      setPendingComplaints(pendingComplaints.filter(c => c.id !== id));
      
      // Add to resolved with response
      const resolvedComplaint = {
        ...complaintToResolve,
        status: 'resolved',
        response,
        resolvedDate: new Date().toISOString().split('T')[0]
      };
      
      setResolvedComplaints([resolvedComplaint, ...resolvedComplaints]);
      toast.success('Complaint resolved successfully');
    }
  };

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
  if (userRole !== 'citizen') {
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
                Review and respond to public complaints related to {userRole === 'water-admin' ? 'water supply' : 'energy services'}
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
                  {filteredPendingComplaints.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No pending complaints</p>
                    </div>
                  ) : (
                    <AdminComplaintsList 
                      complaints={filteredPendingComplaints} 
                      onResolve={handleResolveComplaint}
                      isResolved={false}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="resolved">
                  {filteredResolvedComplaints.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No resolved complaints</p>
                    </div>
                  ) : (
                    <AdminComplaintsList 
                      complaints={filteredResolvedComplaints} 
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
