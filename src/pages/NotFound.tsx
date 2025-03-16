
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-8">
          <span className="text-5xl">🔍</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-janhit-600 hover:bg-janhit-700 text-white flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Return to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
