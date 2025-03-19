
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  MessageSquare, 
  Droplet, 
  Zap, 
  BarChart4, 
  Info, 
  LogIn, 
  LogOut,
  Moon,
  Sun,
  User
} from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const navigate = useNavigate();
  const { userRole, isLoading } = useUserRole();

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Successfully logged out');
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Error signing out');
    }
  };

  return (
    <div className={cn("min-h-screen bg-background flex flex-col")}>
      <header className="w-full py-4 px-6 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-display font-bold text-janhit-700 dark:text-janhit-300 flex items-center gap-2">
            <span className="bg-janhit-600 text-white w-8 h-8 rounded-md flex items-center justify-center">
              JC
            </span>
            <span className="hidden sm:block">JanHitConnect</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" icon={<Home size={16} />} active={location.pathname === '/'}>
            Home
          </NavLink>
          {userRole && (
            <>
              <NavLink to="/complaints" icon={<MessageSquare size={16} />} active={location.pathname.includes('/complaints')}>
                Complaints
              </NavLink>
              {/* Add Water section for both citizens and water admins */}
              {(userRole === 'citizen' || userRole === 'water-admin' || userRole === 'super-admin') && (
                <NavLink to="/water" icon={<Droplet size={16} />} active={location.pathname === '/water'}>
                  Water
                </NavLink>
              )}
              {/* Add Energy section for both citizens and energy admins */}
              {(userRole === 'citizen' || userRole === 'energy-admin' || userRole === 'super-admin') && (
                <NavLink to="/energy" icon={<Zap size={16} />} active={location.pathname === '/energy'}>
                  Energy
                </NavLink>
              )}
              {userRole !== 'citizen' && (
                <NavLink to="/complaints/analytics" icon={<BarChart4 size={16} />} active={location.pathname === '/complaints/analytics'}>
                  Analytics
                </NavLink>
              )}
            </>
          )}
          <NavLink to="/about" icon={<Info size={16} />} active={location.pathname === '/about'}>
            About
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {isLoading ? (
            <div className="w-9 h-9 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : userRole ? (
            <div className="flex items-center gap-2">
              {userRole !== 'citizen' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors mr-1"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-janhit-600 text-white hover:bg-janhit-700 transition-colors"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile navigation */}
      {isMobile && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 px-4">
          <div className="flex justify-around">
            <MobileNavLink to="/" icon={<Home size={20} />} active={location.pathname === '/'} />
            {userRole && (
              <>
                <MobileNavLink to="/complaints" icon={<MessageSquare size={20} />} active={location.pathname.includes('/complaints')} />
                {/* Add Water section for both citizens and water admins */}
                {(userRole === 'citizen' || userRole === 'water-admin' || userRole === 'super-admin') && (
                  <MobileNavLink to="/water" icon={<Droplet size={20} />} active={location.pathname === '/water'} />
                )}
                {/* Add Energy section for both citizens and energy admins */}
                {(userRole === 'citizen' || userRole === 'energy-admin' || userRole === 'super-admin') && (
                  <MobileNavLink to="/energy" icon={<Zap size={20} />} active={location.pathname === '/energy'} />
                )}
                {userRole !== 'citizen' && (
                  <MobileNavLink to="/complaints/analytics" icon={<BarChart4 size={20} />} active={location.pathname === '/complaints/analytics'} />
                )}
              </>
            )}
            <MobileNavLink to="/about" icon={<Info size={20} />} active={location.pathname === '/about'} />
          </div>
        </div>
      )}

      <main className="flex-1 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  active: boolean;
  icon?: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, active, icon }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-janhit-50 text-janhit-700 dark:bg-janhit-900/20 dark:text-janhit-300"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-50 dark:hover:bg-gray-800"
      )}
    >
      {icon}
      {children}
    </Link>
  );
};

interface MobileNavLinkProps {
  to: string;
  active: boolean;
  icon: React.ReactNode;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, active, icon }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center w-12 h-12 rounded-full",
        active
          ? "text-janhit-600 dark:text-janhit-400"
          : "text-gray-500 dark:text-gray-400"
      )}
    >
      {icon}
    </Link>
  );
};

export default MainLayout;
