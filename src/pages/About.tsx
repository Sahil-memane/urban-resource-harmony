
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Droplet, 
  Zap, 
  LineChart,
  Building,
  Users,
  Activity,
  Award
} from 'lucide-react';

const About = () => {
  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <span className="bg-janhit-50 text-janhit-600 text-sm font-medium px-3 py-1 rounded-full">
              About The Project
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            JanHitConnect: Smart Governance Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            An AI-powered platform designed to streamline complaint categorization, optimize water allocation, 
            and promote sustainable energy usage for better urban governance.
          </p>
        </motion.div>

        {/* Vision and Mission */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 mb-20"
        >
          <div className="neo-blur rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-300">
              To create smart cities where resources are optimally utilized, public complaints are efficiently 
              addressed, and sustainable practices are embraced through the power of data and AI.
            </p>
          </div>
          <div className="neo-blur rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Empower citizens and authorities with data-driven insights to improve urban governance, 
              optimize resource distribution, and foster sustainable living practices.
            </p>
          </div>
        </motion.div>

        {/* Key Modules */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Key Modules</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              JanHitConnect comprises three integrated modules designed to address critical aspects of urban governance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ModuleCard 
              icon={<MessageSquare className="h-8 w-8 text-janhit-600" />}
              title="Complaint Categorization"
              description="Utilizes Gemini AI to analyze and classify public complaints, directing them to the appropriate government ministries for faster resolution."
            />
            <ModuleCard 
              icon={<Droplet className="h-8 w-8 text-janhit-600" />}
              title="Smart Water Allocation"
              description="Analyzes five years of water consumption data to forecast weekly water needs and alert residents about potential shortages."
            />
            <ModuleCard 
              icon={<Zap className="h-8 w-8 text-janhit-600" />}
              title="Sustainable Energy Management"
              description="Predicts electricity demand trends and notifies users to adopt energy conservation measures during peak usage periods."
            />
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Technology Stack</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              JanHitConnect leverages cutting-edge technologies to deliver a seamless and powerful experience.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            <TechCard name="React" />
            <TechCard name="TypeScript" />
            <TechCard name="Tailwind CSS" />
            <TechCard name="Flask" />
            <TechCard name="Supabase" />
            <TechCard name="Gemini AI" />
            <TechCard name="Framer Motion" />
            <TechCard name="Chart.js" />
            <TechCard name="Python" />
            <TechCard name="Pandas" />
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Key Benefits</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              JanHitConnect offers numerous advantages for both citizens and authorities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <BenefitCard
              icon={<Building className="h-6 w-6 text-janhit-600" />}
              title="For Authorities"
              benefits={[
                "Data-driven decision making",
                "Efficient complaint resolution",
                "Optimized resource allocation",
                "Reduced operational costs",
                "Enhanced citizen satisfaction"
              ]}
            />
            <BenefitCard
              icon={<Users className="h-6 w-6 text-janhit-600" />}
              title="For Citizens"
              benefits={[
                "Faster complaint resolution",
                "Real-time resource updates",
                "Conservation guidance",
                "Improved service quality",
                "Greater transparency"
              ]}
            />
          </div>
        </motion.div>

        {/* Impact */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <span className="bg-janhit-50 text-janhit-600 text-sm font-medium px-3 py-1 rounded-full">
              Our Impact
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Building Sustainable Communities</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            JanHitConnect aims to create lasting positive impact on urban governance and resource management.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ImpactStat number="30%" text="Faster complaint resolution" icon={<Activity />} />
            <ImpactStat number="25%" text="Water conservation" icon={<Droplet />} />
            <ImpactStat number="20%" text="Energy savings" icon={<Zap />} />
            <ImpactStat number="40%" text="Increased citizen satisfaction" icon={<Award />} />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <div className="neo-blur rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to experience smart governance?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Join JanHitConnect today and be part of the solution for better urban living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/register" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-janhit-600 hover:bg-janhit-700 transition-colors"
              >
                Create Account
              </a>
              <a 
                href="/login" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Log In
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ icon, title, description }) => {
  return (
    <div className="neo-blur rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
      <div className="mb-4 p-3 bg-janhit-50 rounded-lg">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

interface TechCardProps {
  name: string;
}

const TechCard: React.FC<TechCardProps> = ({ name }) => {
  return (
    <div className="flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <span className="font-medium text-gray-800 dark:text-gray-200">{name}</span>
    </div>
  );
};

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  benefits: string[];
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, benefits }) => {
  return (
    <div className="neo-blur rounded-2xl p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-janhit-50 rounded-md mr-3">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start">
            <svg className="h-5 w-5 text-janhit-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface ImpactStatProps {
  number: string;
  text: string;
  icon: React.ReactNode;
}

const ImpactStat: React.FC<ImpactStatProps> = ({ number, text, icon }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 text-janhit-600">
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{number}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">{text}</div>
    </div>
  );
};

export default About;
