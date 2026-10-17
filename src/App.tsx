import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PresentationModeProvider } from "@/contexts/PresentationModeContext";
import { PresentationModeBanner } from "@/components/PresentationModeBanner";
import { useThemeFavicon } from "@/hooks/useThemeFavicon";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Graduation from "./pages/Graduation";
import MenuUpload from "./pages/MenuUpload";
import Admin from "./pages/Admin";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SecretWarning from "./pages/SecretWarning";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import LandingPage from "@/components/landing/LandingPage";
import { HiddenCornerAnchor } from "@/components/HiddenCornerAnchor";
import { ConsoleDetector } from "@/components/ConsoleDetector";
import { GrandmasterCelebration } from "@/components/GrandmasterCelebration";

const queryClient = new QueryClient();

// Component to use the favicon hook inside ThemeProvider
function ThemeFaviconHandler({ children }: { children: React.ReactNode }) {
  useThemeFavicon();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <PresentationModeProvider>
          <ThemeFaviconHandler>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <PresentationModeBanner />
              <BrowserRouter>
                <ConsoleDetector />
                <GrandmasterCelebration />
                <HiddenCornerAnchor />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/graduation" element={<Graduation />} />
                  <Route path="/menu-upload" element={<MenuUpload />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/welcome" element={<LandingPage />} />
                  <Route path="/secret-warning" element={<SecretWarning />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeFaviconHandler>
        </PresentationModeProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
