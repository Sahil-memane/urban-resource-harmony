
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Droplet, 
  Zap,
  BarChart4,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('janhit-token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-white via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(0,122,204,0.3),transparent)]"></div>
        
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-200/10 blur-3xl -z-10"
          animate={{ 
            y: [0, 30, 0],
            x: [0, -20, 0]
          }} 
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-300/10 blur-3xl -z-10"
          animate={{ 
            y: [0, -30, 0],
            x: [0, 20, 0]
          }} 
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <div className="container px-4 mx-auto max-w-6xl relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center px-3 py-1 mb-4 text-sm font-medium text-janhit-700 bg-janhit-50 rounded-full">
                Smart Governance Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                Empowering Communities Through{' '}
                <span className="text-janhit-600 dark:text-janhit-400">Smart Governance</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                JanHitConnect streamlines public services, optimizes resource allocation, and enhances civic engagement through AI-powered solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isLoggedIn ? (
                  <Button 
                    className="bg-janhit-600 hover:bg-janhit-700 text-white px-8 py-6 text-lg flex items-center gap-2"
                    onClick={() => navigate('/complaints')}
                  >
                    Access Dashboard
                    <ArrowRight size={18} />
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="bg-janhit-600 hover:bg-janhit-700 text-white px-8 py-6 text-lg flex items-center gap-2"
                      onClick={() => navigate('/register')}
                    >
                      Get Started
                      <ArrowRight size={18} />
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-gray-300 dark:border-gray-700 px-8 py-6 text-lg"
                      onClick={() => navigate('/login')}
                    >
                      Log In
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center px-3 py-1 mb-4 text-sm font-medium text-janhit-700 bg-janhit-50 rounded-full">
              Key Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Comprehensive Smart Governance Solutions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              JanHitConnect offers a suite of integrated tools to address the diverse challenges of urban governance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare size={24} />}
              title="Complaint Management"
              description="AI-powered categorization and routing of public complaints to appropriate government departments for faster resolution."
              delay={0.3}
              link="/complaints"
            />
            <FeatureCard
              icon={<Droplet size={24} />}
              title="Water Resource Allocation"
              description="Predictive analytics for efficient water distribution, with alerts for potential shortages based on historical patterns."
              delay={0.4}
              link="/water"
            />
            <FeatureCard
              icon={<Zap size={24} />}
              title="Energy Optimization"
              description="Smart monitoring and forecasting of electricity demand to promote sustainable usage and reduce peak load."
              delay={0.5}
              link="/energy"
            />
            <FeatureCard
              icon={<BarChart4 size={24} />}
              title="Data Analytics"
              description="Comprehensive dashboards with actionable insights on resource utilization and civic engagement metrics."
              delay={0.6}
              link="/analytics"
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h5"></path><path d="M9 18l3-3-3-3"></path><path d="M13 6l-3 3 3 3"></path><path d="M17 18h5"></path></svg>}
              title="Real-time Updates"
              description="Instant notifications on complaint status, resource availability, and conservation recommendations."
              delay={0.7}
              link="/notifications"
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H3"></path><path d="M21 9h-9a3 3 0 0 0-3 3 3 3 0 0 0 3 3h9-9a3 3 0 0 1-3-3 3 3 0 0 1 3-3h9"></path></svg>}
              title="Multi-stakeholder Integration"
              description="Seamless collaboration between citizens, government agencies, and utility providers on a unified platform."
              delay={0.8}
              link="/stakeholders"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center px-3 py-1 mb-4 text-sm font-medium text-janhit-700 bg-janhit-50 rounded-full">
              Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              How JanHitConnect Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our intelligent platform processes data to deliver actionable insights and automated solutions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Data Collection"
              description="Aggregates complaints, consumption patterns, and resource utilization data from multiple sources."
              delay={0.3}
            />
            <StepCard
              number="02"
              title="AI Processing"
              description="Analyzes data using machine learning algorithms to categorize complaints and predict resource needs."
              delay={0.4}
            />
            <StepCard
              number="03"
              title="Intelligent Routing"
              description="Directs complaints to relevant departments and generates resource allocation recommendations."
              delay={0.5}
            />
            <StepCard
              number="04"
              title="Real-time Monitoring"
              description="Continuously tracks resource usage and complaint resolution status to ensure optimal outcomes."
              delay={0.6}
            />
            <StepCard
              number="05"
              title="Predictive Alerts"
              description="Forecasts potential shortages or issues and sends proactive notifications to stakeholders."
              delay={0.7}
            />
            <StepCard
              number="06"
              title="Performance Analytics"
              description="Provides comprehensive insights on system efficiency and areas for improvement."
              delay={0.8}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="neo-blur rounded-2xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(circle_700px_at_100%_200px,rgba(0,122,204,0.3),transparent)]"></div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to transform your community?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Join JanHitConnect today and be part of the smart governance revolution. Experience streamlined services, optimized resources, and enhanced civic engagement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {isLoggedIn ? (
                    <Button 
                      className="bg-janhit-600 hover:bg-janhit-700 text-white flex items-center gap-2"
                      onClick={() => navigate('/complaints')}
                    >
                      Access Dashboard
                      <ArrowRight size={16} />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        className="bg-janhit-600 hover:bg-janhit-700 text-white flex items-center gap-2"
                        onClick={() => navigate('/register')}
                      >
                        Get Started
                        <ArrowRight size={16} />
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700"
                        onClick={() => navigate('/login')}
                      >
                        Log In
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="hidden md:block">
                <img 
                  src="/public/lovable-uploads/f1a646eb-6587-4fac-9e7a-8d844edfd94c.png" 
                  alt="Smart City" 
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  link: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay, link }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="neo-blur rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => navigate(link)}
    >
      <div className="h-12 w-12 rounded-lg bg-janhit-50 flex items-center justify-center mb-4 text-janhit-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      <div className="flex items-center text-janhit-600 font-medium text-sm">
        <span>Learn more</span>
        <ChevronRight size={16} className="ml-1" />
      </div>
    </motion.div>
  );
};

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  delay: number;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"
    >
      <div className="text-4xl font-bold text-janhit-200 mb-4">{number}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
};

export default Index;
