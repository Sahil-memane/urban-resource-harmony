
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { initializeStorage } from "@/integrations/supabase/client";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Complaints from "./pages/Complaints";
import ComplaintsAnalytics from "./pages/ComplaintsAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import Water from "./pages/Water";
import Energy from "./pages/Energy";

// Components
import Chatbot from "./components/chatbot/Chatbot";

const queryClient = new QueryClient();

const App = () => {
  // Initialize storage bucket on app load
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/complaints/analytics" element={<ComplaintsAnalytics />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/water" element={<Water />} />
              <Route path="/energy" element={<Energy />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
