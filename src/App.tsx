import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // Versão real com Supabase
import { EditModeProvider } from "./contexts/EditModeContext";
import Layout from "./components/layout/Layout";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // Importe o ProtectedRoute
import Home from "./pages/Home";
import Financial from "./pages/Financial";
import Calendar from "./pages/Calendar";
import Students from "./pages/Students";
import Enrollment from "./pages/Enrollment";
import Teachers from "./pages/Teachers";
import Roles from "./pages/Roles";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Employees from "./pages/Employees";
import Modalities from "./pages/Modalities";
import NewStudent from "./pages/NewStudent";
import NewEvent from "./pages/NewEvent";
import Reports from "./pages/Reports";
import NFSe from "./pages/NFSe";
import NFSeEmit from "./pages/NFSeEmit";
import Marketing from "./pages/Marketing";
import InauguralClass from "./pages/InauguralClass";
import InauguralSignUp from "./pages/InauguralSignUp";
import EnrollmentSignUp from "./pages/EnrollmentSignUp";
import EnrollmentForm from "./pages/EnrollmentForm";
import GuardianInauguralDashboard from "./pages/GuardianInauguralDashboard";
import EnrollmentDashboard from "./pages/EnrollmentDashboard";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-foreground text-lg">Carregando...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <AppLayout>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/inaugural-signup" element={<InauguralSignUp />} />
          <Route path="/enrollment-signup" element={<EnrollmentSignUp />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<ProtectedRoute allowedFlows={['admin']}><Home /></ProtectedRoute>} />
        <Route path="/financial" element={<ProtectedRoute allowedFlows={['admin']}><Financial /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute allowedFlows={['admin']}><Calendar /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute allowedFlows={['admin']}><Students /></ProtectedRoute>} />
        <Route path="/enrollment" element={<ProtectedRoute allowedFlows={['admin']}><Enrollment /></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute allowedFlows={['admin']}><Teachers /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute allowedFlows={['admin']}><Roles /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute allowedFlows={['admin']}><Employees /></ProtectedRoute>} />
        <Route path="/modalities" element={<ProtectedRoute allowedFlows={['admin']}><Modalities /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedFlows={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="/marketing" element={<ProtectedRoute allowedFlows={['admin']}><Marketing /></ProtectedRoute>} />
        <Route path="/nfs-e" element={<ProtectedRoute allowedFlows={['admin']}><NFSe /></ProtectedRoute>} />
        <Route path="/nfs-e/emit" element={<ProtectedRoute allowedFlows={['admin']}><NFSeEmit /></ProtectedRoute>} />
        <Route path="/students/new" element={<ProtectedRoute allowedFlows={['admin']}><NewStudent /></ProtectedRoute>} />
        <Route path="/events/new" element={<ProtectedRoute allowedFlows={['admin']}><NewEvent /></ProtectedRoute>} />
        <Route path="/events/edit/:id" element={<ProtectedRoute allowedFlows={['admin']}><NewEvent /></ProtectedRoute>} />
        <Route path="/inaugural-class" element={<ProtectedRoute><InauguralClass /></ProtectedRoute>} />
        <Route path="/enrollment-form" element={<ProtectedRoute><EnrollmentForm /></ProtectedRoute>} />
        <Route path="/inaugural-dashboard" element={<ProtectedRoute><GuardianInauguralDashboard /></ProtectedRoute>} />
        <Route path="/enrollment-dashboard" element={<ProtectedRoute><EnrollmentDashboard /></ProtectedRoute>} />
        <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      </Routes>
      </Layout>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider> {/* AuthProvider deve envolver a aplicação */}
        <EditModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </EditModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
