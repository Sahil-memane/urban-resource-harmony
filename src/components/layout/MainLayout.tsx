
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Sun 
} from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const navigate = useNavigate();

  // Check if user is logged in from localStorage on mount
  React.useEffect(() => {
    const token = localStorage.getItem('janhit-token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('janhit-token');
    setIsLoggedIn(false);
    toast.success('Successfully logged out');
    navigate('/');
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
          {isLoggedIn && (
            <>
              <NavLink to="/complaints" icon={<MessageSquare size={16} />} active={location.pathname === '/complaints'}>
                Complaints
              </NavLink>
              <NavLink to="/water" icon={<Droplet size={16} />} active={location.pathname === '/water'}>
                Water
              </NavLink>
              <NavLink to="/energy" icon={<Zap size={16} />} active={location.pathname === '/energy'}>
                Energy
              </NavLink>
              <NavLink to="/analytics" icon={<BarChart4 size={16} />} active={location.pathname === '/analytics'}>
                Analytics
              </NavLink>
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
          
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
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
            {isLoggedIn && (
              <>
                <MobileNavLink to="/complaints" icon={<MessageSquare size={20} />} active={location.pathname === '/complaints'} />
                <MobileNavLink to="/water" icon={<Droplet size={20} />} active={location.pathname === '/water'} />
                <MobileNavLink to="/energy" icon={<Zap size={20} />} active={location.pathname === '/energy'} />
                <MobileNavLink to="/analytics" icon={<BarChart4 size={20} />} active={location.pathname === '/analytics'} />
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
