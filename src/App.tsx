import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useInteractionTracker } from "@/hooks/useInteractionTracker";
import AuthGuard from "@/components/AuthGuard";
import { CartProvider } from "@/contexts/CartContext";
import { GemConnectionProvider } from "@/contexts/GemConnectionContext";
import DevGemToggle from "@/components/DevGemToggle";
import DevTierToggle from "@/components/DevTierToggle";
import ActiveSessionStrip from "@/components/hardware/ActiveSessionStrip";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import MirrorCheck from "./pages/MirrorCheck";
import DeepScan from "./pages/DeepScan";
import VoiceTest from "./pages/VoiceTest";
import GuestScan from "./pages/GuestScan";
import GuestResults from "./pages/GuestResults";
import ResultsLoading from "./pages/ResultsLoading";
import Dashboard from "./pages/Dashboard";
import PillarDetail from "./pages/PillarDetail";
import BioIdentity from "./pages/BioIdentity";
import Longevity from "./pages/Longevity";
import Nutrition from "./pages/Nutrition";
import Leaderboards from "./pages/Leaderboards";
import Profile from "./pages/Profile";
import AICoach from "./pages/AICoach";
import GemDetect from "./pages/gem/GemDetect";
import GemCorrect from "./pages/gem/GemCorrect";
import GemProtect from "./pages/gem/GemProtect";
import MiHealthCorrect from "./pages/mihealth/MiHealthCorrect";
import MiHealthProtect from "./pages/mihealth/MiHealthProtect";
import Learn from "./pages/Learn";
import Shop from "./pages/Shop";
import ShopCategory from "./pages/ShopCategory";
import Basket from "./pages/Basket";
import Checkout from "./pages/Checkout";
import Protect from "./pages/Protect";
import ProtectHub from "./pages/ProtectHub";
import Bookings from "./pages/Bookings";

import TongueTest from "./pages/TongueTest";
import ScanHub from "./pages/ScanHub";
import MyClients from "./pages/MyClients";
import AcceptInvite from "./pages/AcceptInvite";
import Home from "./pages/Home";
import MyPractitioner from "./pages/MyPractitioner";
import FindPractitioner from "./pages/FindPractitioner";
import ClientDetail from "./pages/ClientDetail";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    {children}
  </AuthGuard>
);

const AppContent = () => {
  useInteractionTracker();
  return (
    <Routes>
      {/* Public / trial routes */}
      <Route path="/" element={<Splash />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/mirror-check" element={<MirrorCheck />} />
      <Route path="/deep-scan" element={<DeepScan />} />
      <Route path="/voice-test" element={<VoiceTest />} />
      <Route path="/tongue-test" element={<TongueTest />} />
      <Route path="/guest-scan" element={<GuestScan />} />
      <Route path="/guest-results" element={<GuestResults />} />
      <Route path="/results-loading" element={<ResultsLoading />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* Protected routes */}
      <Route path="/home" element={<Protected><Home /></Protected>} />
      <Route path="/scan" element={<Protected><ScanHub /></Protected>} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/pillar/:pillarId" element={<Protected><PillarDetail /></Protected>} />
      <Route path="/pillar-detail" element={<Protected><PillarDetail /></Protected>} />
      <Route path="/bio-identity" element={<Protected><BioIdentity /></Protected>} />
      <Route path="/longevity" element={<Protected><Longevity /></Protected>} />
      <Route path="/nutrition" element={<Protected><Nutrition /></Protected>} />
      <Route path="/leaderboards" element={<Protected><Leaderboards /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/ai-coach" element={<Protected><AICoach /></Protected>} />
      <Route path="/correct" element={<Protected><Protect /></Protected>} />
      <Route path="/protect" element={<Protected><ProtectHub /></Protected>} />
      <Route path="/gem/detect" element={<Protected><GemDetect /></Protected>} />
      <Route path="/gem/correct" element={<Protected><GemCorrect /></Protected>} />
      <Route path="/gem/protect" element={<Protected><GemProtect /></Protected>} />
      <Route path="/mihealth/correct" element={<Protected><MiHealthCorrect /></Protected>} />
      <Route path="/mihealth/protect" element={<Protected><MiHealthProtect /></Protected>} />
      <Route path="/learn" element={<Protected><Learn /></Protected>} />
      <Route path="/shop" element={<Protected><Shop /></Protected>} />
      <Route path="/shop/:category" element={<Protected><ShopCategory /></Protected>} />
      <Route path="/basket" element={<Protected><Basket /></Protected>} />
      <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
      
      <Route path="/clients" element={<Protected><MyClients /></Protected>} />
      <Route path="/clients/:clientId" element={<Protected><ClientDetail /></Protected>} />
      <Route path="/my-practitioner" element={<Protected><MyPractitioner /></Protected>} />
      <Route path="/find-practitioner" element={<Protected><FindPractitioner /></Protected>} />
      <Route path="/subscription" element={<Protected><Subscription /></Protected>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <GemConnectionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DevGemToggle />
            <DevTierToggle />
            <AppContent />
            <ActiveSessionStrip />
          </BrowserRouter>
        </TooltipProvider>
      </GemConnectionProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
