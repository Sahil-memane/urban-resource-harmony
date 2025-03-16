
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('citizen');
  const navigate = useNavigate();
  const { userRole } = useUserRole();

  // If already logged in, redirect to appropriate page
  useEffect(() => {
    if (userRole) {
      if (userRole === 'citizen') {
        navigate('/');
      } else {
        navigate('/admin');
      }
    }
  }, [userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        // Handle login based on user role
        if (profile.role === 'citizen') {
          toast.success('Successfully logged in as Citizen');
          navigate('/');
        } else if (profile.role === 'water-admin' || profile.role === 'energy-admin' || profile.role === 'super-admin') {
          toast.success(`Logged in as ${profile.role}`);
          navigate('/admin');
        } else {
          toast.success('Successfully logged in');
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-950"></div>
      <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(circle_700px_at_50%_300px,rgba(0,122,204,0.1),transparent)]"></div>
      
      {/* Floating elements */}
      <motion.div 
        className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-200/20 to-cyan-200/20 blur-3xl -z-10"
        animate={{ 
          y: [0, 20, 0],
          x: [0, -10, 0]
        }} 
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-gradient-to-l from-blue-200/20 to-indigo-200/20 blur-3xl -z-10"
        animate={{ 
          y: [0, -30, 0],
          x: [0, 15, 0]
        }} 
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="w-full max-w-md">
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="neo-blur rounded-2xl p-8 shadow-xl w-full"
        >
          <div className="mb-6 text-center">
            <Link to="/" className="inline-block">
              <div className="flex items-center justify-center gap-2">
                <span className="bg-janhit-600 text-white w-10 h-10 rounded-md flex items-center justify-center text-lg font-bold">
                  JC
                </span>
              </div>
            </Link>
            <h1 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">Welcome to JanHitConnect</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Login or create an account to access smart governance features
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType" className="text-sm font-medium">
                Login As
              </Label>
              <Select
                value={userType}
                onValueChange={setUserType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">Citizen</SelectItem>
                  <SelectItem value="admin">Government Admin</SelectItem>
                </SelectContent>
              </Select>
              {userType === 'admin' && (
                <p className="text-xs text-muted-foreground">
                  Demo: For Water Admin use email with "water", for Energy Admin use email with "energy"
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-janhit-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-janhit-500"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-janhit-600 focus:ring-janhit-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-600 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <a href="#" className="font-medium text-janhit-600 hover:text-janhit-500 dark:text-janhit-400">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-janhit-600 hover:bg-janhit-700 text-white flex items-center justify-center gap-2",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <LogIn size={18} />
              )}
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-janhit-600 hover:text-janhit-500 dark:text-janhit-400">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
