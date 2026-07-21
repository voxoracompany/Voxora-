import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProjectProvider } from "./context/ProjectContext";
import { ActivityProvider } from "./context/ActivityContext";
import { ToastProvider } from "./context/ToastContext";
import { AIProvider } from "./context/AIContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CloudProvider } from "./context/CloudContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/public/Login";
import SignUp from "./pages/public/SignUp";
import About from "./pages/public/About";
import Blog from "./pages/public/Blog";
import Careers from "./pages/public/Careers";
import Contact from "./pages/public/Contact";
import Pricing from "./pages/public/Pricing";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsOfService from "./pages/public/TermsOfService";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";
import EmailVerification from "./pages/public/EmailVerification";

// Platform pages
import AICommandCenter from "./pages/platforms/AICommandCenter";
import StartupStudio from "./pages/platforms/StartupStudio";
import MarketingStudio from "./pages/platforms/MarketingStudio";
import FinancialStudio from "./pages/platforms/FinancialStudio";
import InvestorStudio from "./pages/platforms/InvestorStudio";

// Solution pages
import Creators from "./pages/solutions/Creators";
import Entrepreneurs from "./pages/solutions/Entrepreneurs";
import Businesses from "./pages/solutions/Businesses";
import Developers from "./pages/solutions/Developers";

// Dashboard & 404 (lazy)
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const NotFound  = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f8fafc",
    }}>
      <div style={{
        width: 40, height: 40, border: "3px solid #e5e7eb",
        borderTopColor: "#6C63FF", borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// CloudProvider needs userId from AuthContext, so it lives inside AuthProvider
function CloudWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <CloudProvider userId={user?.id ?? null}>{children}</CloudProvider>;
}

import React from "react";

export default function App() {
  return (
    <AuthProvider>
      <CloudWrapper>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* Platforms */}
            <Route path="/platforms/ai-command-center" element={<AICommandCenter />} />
            <Route path="/platforms/startup-studio" element={<StartupStudio />} />
            <Route path="/platforms/marketing-studio" element={<MarketingStudio />} />
            <Route path="/platforms/financial-studio" element={<FinancialStudio />} />
            <Route path="/platforms/investor-studio" element={<InvestorStudio />} />

            {/* Solutions */}
            <Route path="/solutions/creators" element={<Creators />} />
            <Route path="/solutions/entrepreneurs" element={<Entrepreneurs />} />
            <Route path="/solutions/businesses" element={<Businesses />} />
            <Route path="/solutions/developers" element={<Developers />} />

            {/* App — protected, wrapped with all context providers */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ToastProvider>
                  <ActivityProvider>
                    <ProjectProvider>
                      <AIProvider>
                        <SubscriptionProvider>
                          <Dashboard />
                        </SubscriptionProvider>
                      </AIProvider>
                    </ProjectProvider>
                  </ActivityProvider>
                </ToastProvider>
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </CloudWrapper>
    </AuthProvider>
  );
}
