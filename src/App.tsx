import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import PricesPage from "./pages/PricesPage";
import GuidesPage from "./pages/GuidesPage";
import NearbyPlacesPage from "./pages/NearbyPlacesPage";
import SOSPage from "./pages/SOSPage";
import ReportPage from "./pages/ReportPage";
import ChatPage from "./pages/ChatPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/prices" element={<PricesPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/nearby" element={<NearbyPlacesPage />} />
            <Route path="/sos" element={<SOSPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
