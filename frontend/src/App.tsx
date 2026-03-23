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
import ProtectedRoute from "./components/ProtectedRoute";

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
              
              {/* Citizen Routes */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['citizen', 'user']}><CitizenDashboard /></ProtectedRoute>} />
              <Route path="/file-complaint" element={<ProtectedRoute allowedRoles={['citizen', 'user']}><FileComplaint /></ProtectedRoute>} />
              <Route path="/applications/sent" element={<ProtectedRoute allowedRoles={['citizen', 'user']}><SentApplications /></ProtectedRoute>} />
              <Route path="/applications/modify" element={<ProtectedRoute allowedRoles={['citizen', 'user']}><ModifyApplication /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              
              {/* Resolver Routes */}
              <Route path="/resolver" element={<ProtectedRoute allowedRoles={['resolver']}><ResolverDashboard /></ProtectedRoute>} />
              
              {/* Common Protected Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/municipality/nearest" element={<ProtectedRoute><NearestMunicipality /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
