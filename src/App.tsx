import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { EditModeProvider } from "./contexts/EditModeContext";
import Layout from "./components/layout/Layout";
import AppLayout from "./components/layout/AppLayout";
import GuardianMobileLayout from "./components/layout/GuardianMobileLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
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
import GuardianHome from "./pages/GuardianHome";
import InauguralPreRegister from "./pages/InauguralPreRegister";
import GuardianStudentData from "./pages/GuardianStudentData";
import GuardianPayments from "./pages/GuardianPayments";
import GuardianCalendar from "./pages/GuardianCalendar";
import GuardianContract from "./pages/GuardianContract";
import StudentFinancial from "./pages/StudentFinancial";

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
    <Routes>
      {/* Rotas públicas - SEM layout com menus */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/inaugural-signup" element={<InauguralSignUp />} />
      <Route path="/enrollment-signup" element={<EnrollmentSignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Rotas do Responsável (Guardian) - Layout próprio */}
      <Route path="/guardian" element={
        <ProtectedRoute allowedFlows={['inaugural', 'enrollment']}>
          <GuardianMobileLayout />
        </ProtectedRoute>
      }>
        <Route index element={<GuardianHome />} />
        <Route path="inaugural" element={<InauguralPreRegister />} />
        <Route path="inaugural-dashboard" element={<GuardianInauguralDashboard />} />
        <Route path="enrollment" element={<EnrollmentForm />} />
        <Route path="dashboard" element={<EnrollmentDashboard />} />
            <Route path="student" element={<GuardianStudentData />} />
            <Route path="payments" element={<GuardianPayments />} />
            <Route path="calendar" element={<GuardianCalendar />} />
            <Route path="contract" element={<GuardianContract />} />
      </Route>
      
      {/* Rotas Admin protegidas - COM layout com menus */}
      <Route path="/*" element={
        <ProtectedRoute allowedFlows={['admin']}>
          <AppLayout>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/financial" element={<Financial />} />
                <Route path="/student-financial" element={<StudentFinancial />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/students" element={<Students />} />
                <Route path="/enrollment" element={<Enrollment />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/modalities" element={<Modalities />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/nfs-e" element={<NFSe />} />
                <Route path="/nfs-e/emit" element={<NFSeEmit />} />
                <Route path="/students/new" element={<NewStudent />} />
                <Route path="/events/new" element={<NewEvent />} />
                <Route path="/events/edit/:id" element={<NewEvent />} />
                <Route path="/inaugural-class" element={<InauguralClass />} />
                <Route path="/enrollment-form" element={<EnrollmentForm />} />
                <Route path="/inaugural-dashboard" element={<GuardianInauguralDashboard />} />
                <Route path="/enrollment-dashboard" element={<EnrollmentDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </AppLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
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
