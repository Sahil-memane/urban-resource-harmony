
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Define the possible user roles
type UserRole = 'citizen' | 'water-admin' | 'energy-admin' | 'super-admin' | null;

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is a mock implementation - in production this would check Supabase auth
    const checkUserRole = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if user is logged in
        const token = localStorage.getItem('janhit-token');
        
        if (!token) {
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        // In production, you would get the role from Supabase
        // For now, we'll mock it based on a value in localStorage
        const role = localStorage.getItem('janhit-user-role');
        
        if (role === 'water-admin' || role === 'energy-admin' || role === 'super-admin') {
          setUserRole(role as UserRole);
        } else {
          // Default role for logged in users
          setUserRole('citizen');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        toast.error('Failed to check user role');
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  // Function to set user role (would be called after login)
  const setRole = (role: UserRole) => {
    if (role) {
      localStorage.setItem('janhit-user-role', role);
    } else {
      localStorage.removeItem('janhit-user-role');
    }
    setUserRole(role);
  };

  return { userRole, isLoading, setRole };
};
