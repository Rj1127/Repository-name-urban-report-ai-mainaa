import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/CitizenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ResolverDashboard from "./pages/ResolverDashboard";
import Profile from "./pages/Profile";
import FileComplaint from "./pages/FileComplaint";
import SentApplications from "./pages/SentApplications";
import ModifyApplication from "./pages/ModifyApplication";
import NearestMunicipality from "./pages/NearestMunicipality";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors position="top-center" />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<CitizenDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/resolver" element={<ResolverDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/file-complaint" element={<FileComplaint />} />
              <Route path="/applications/sent" element={<SentApplications />} />
              <Route path="/applications/modify" element={<ModifyApplication />} />
              <Route path="/municipality/nearest" element={<NearestMunicipality />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
