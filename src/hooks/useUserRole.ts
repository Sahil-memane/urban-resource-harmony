
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define the possible user roles
export type UserRole = 'citizen' | 'water-admin' | 'energy-admin' | 'super-admin' | null;

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        setIsLoading(true);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          setUserRole(null);
          setUserId(null);
          return;
        }

        setUserId(session.user.id);
        
        // Get the user's profile with role information
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        // Set the role
        if (profile && (
          profile.role === 'citizen' || 
          profile.role === 'water-admin' || 
          profile.role === 'energy-admin' || 
          profile.role === 'super-admin'
        )) {
          setUserRole(profile.role as UserRole);
        } else {
          setUserRole('citizen'); // Default role
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        toast.error('Failed to check user role');
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkUserRole();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUserRole();
      } else {
        setUserRole(null);
        setUserId(null);
        setIsLoading(false);
      }
    });

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to set user role (would be called after login)
  const setRole = async (role: UserRole) => {
    if (!role) {
      setUserRole(null);
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', session.user.id);
          
        if (error) throw error;
      }
      
      setUserRole(role);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  return { userRole, userId, isLoading, setRole };
};
