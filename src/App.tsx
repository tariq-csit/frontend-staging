import './App.css'
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ClientLists from './components/clientLists/ClientLists';
import DashboardRouter from '@/components/dashboard/DashboardRouter';
import Root from '@/components/Root';
import PentestersList from './components/pentests/pentestersList/PentestersList';
import ClientUsers from './components/clientLists/ClientUsers';
import Login from '@/components/login/Login';
import PentestsList from '@/components/pentests/Pentests';
import PentestDetails from '@/components/pentests/PentestDetails';
import SignUp from '@/components/signUp/SignUp';
import NewPentestsForm from '@/components/pentests/newPentestsForm/NewPentestsForm';
import ForgotPassword from './components/login/ForgotPassword';
import ResetPassword from './components/login/ResetPassword';
import FormPreview from '@/components/vulenerabilityReports/subcomponents/FormPreview';
import VulnerabilityReportForm from '@/components/vulenerabilityReports/subcomponents/VulnerabilityReportForm';
import VulnerabilityReports from '@/components/vulenerabilityReports/VulnerabilityReports';
import VulnerabilitiesInPentest from '@/components/vulenerabilityReports/VulnerabilityDetails';
import Settings from '@/components/settings/Settings';
import ManagePentestReport from '@/components/pentests/managePentest/ManagePentestReport';
import PentestReport from '@/components/pentests/managePentest/PentestReport';
import RetestReport from '@/components/pentests/managePentest/RetestReport';
import { Toaster } from './components/ui/toaster';
import { SidebarProvider } from './contexts/SidebarContext';
import { usePageTitle } from './hooks/usePageTitle';
import ReportsForm from '@/components/vulenerabilityReports/subcomponents/VulnerabilityReportForm';
import { ThemeProvider } from './components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from './hooks/useUser';
import { ReactNode } from 'react';
import { toast } from './hooks/use-toast';
import { Navigate, useLocation } from 'react-router-dom';
import IntegrationsPage from '@/components/integration/IntegrationsPage';
import JiraCallback from '@/components/integration/JiraCallback';
import JiraSetup from '@/components/integration/JiraSetup';
import SlackCallback from '@/components/integration/SlackCallback';
import SlackSetup from '@/components/integration/SlackSetup';
import DebugLogsPage from '@/pages/DebugLogsPage';

// Component that only allows admin users to access a route
const AdminProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, isPentester } = useUser();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // If user is a pentester, redirect back and show a toast
  if (isPentester()) {
    toast({
      title: "You are not authorized to access this page",
      description: "Please contact your administrator",
      variant: "destructive",
    })
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise render the children (the protected component)
  return <>{children}</>;
};

// Component that only allows client users to access a route
const ClientProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, isClient } = useUser();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // If user is not a client, redirect back and show a toast
  if (!isClient()) {
    toast({
      title: "You are not authorized to access this page",
      description: "This page is only available for client users",
      variant: "destructive",
    })
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise render the children (the protected component)
  return <>{children}</>;
};

// Component that blocks client users from accessing a route
const NonClientProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, isClient } = useUser();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // If user is a client, redirect back and show a toast
  if (isClient()) {
    toast({
      title: "You are not authorized to access this page",
      description: "Please contact your administrator",
      variant: "destructive",
    })
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise render the children (the protected component)
  return <>{children}</>;
};

// Component that blocks both pentester and client users from accessing a route (admin only)
const AdminOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, isAdmin } = useUser();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // If user is not an admin, redirect back and show a toast
  if (!isAdmin()) {
    toast({
      title: "You are not authorized to access this page",
      description: "Please contact your administrator",
      variant: "destructive",
    })
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise render the children (the protected component)
  return <>{children}</>;
};

function App() {
  usePageTitle('Slash - Security Dashboard');
  const queryClient = new QueryClient();
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password/:token' element={<ResetPassword />} />
            <Route path='/' element={<Layout />}>
              <Route index element={<Root />} />
              <Route path='dashboard' element={<DashboardRouter />} />

              <Route path='/pentests' element={<PentestsList />} />
              <Route path='/pentests/:pentestId/' element={<PentestDetails />} />
              <Route path='/pentests/:pentestId/edit' element={
                <AdminOnlyRoute>
                  <NewPentestsForm />
                </AdminOnlyRoute>
              } />
              <Route path='/pentests/:pentestId/vulnerabilities' element={<VulnerabilitiesInPentest />} />
              <Route path='/pentests/create' element={
                <AdminProtectedRoute>
                  <NewPentestsForm />
                </AdminProtectedRoute>
              } />

              <Route path='/pentests/:pentestId/manage-report' element={
                <AdminProtectedRoute>
                  <ManagePentestReport />
                </AdminProtectedRoute>
              } />
              <Route path='/pentests/:pentestId/pentest-report' element={
                <AdminProtectedRoute>
                  <PentestReport />
                </AdminProtectedRoute>
              } />
              <Route path='/pentests/:pentestId/retest-report' element={
                <AdminProtectedRoute>
                  <RetestReport />
                </AdminProtectedRoute>
              } />

              <Route path='/vulnerability-reports/:pentestId/vulnerabilities/:vulnerabilityId' element={<FormPreview />} />
              <Route path='/vulnerability-reports/:pentestId/vulnerabilities/:vulnerabilityId/edit' element={
                <NonClientProtectedRoute>
                  <VulnerabilityReportForm />
                </NonClientProtectedRoute>
              } />
              <Route path='/vulnerability-reports/:pentestId' element={<VulnerabilityReports />} />
              <Route path='/vulnerability-reports/' element={<VulnerabilityReports />} />
              <Route path='/vulnerability-reports/:pentestId/create' element={
                <NonClientProtectedRoute>
                  <ReportsForm />
                </NonClientProtectedRoute>
              } />

              <Route path='/clients' element={
                <AdminOnlyRoute>
                  <ClientLists />
                </AdminOnlyRoute>
              } />
              <Route path='/clients/users' element={
                <AdminProtectedRoute>
                  <ClientUsers />
                </AdminProtectedRoute>
              } />

              <Route path='/pentesters' element={
                <AdminOnlyRoute>
                  <PentestersList />
                </AdminOnlyRoute>
              } />

              <Route path='/settings' element={<Settings />} />

              <Route path='/integrations' element={
                <ClientProtectedRoute>
                  <IntegrationsPage />
                </ClientProtectedRoute>
              } />

              <Route path='/integrations/jira/setup' element={
                <ClientProtectedRoute>
                  <JiraSetup />
                </ClientProtectedRoute>
              } />

              <Route path='/clients/integrations/jira/callback' element={<JiraCallback />} />

              <Route path='/integrations/slack/setup' element={
                <ClientProtectedRoute>
                  <SlackSetup />
                </ClientProtectedRoute>
              } />

              <Route path='/integrations/slack/success' element={<SlackCallback />} />
              <Route path='/clients/integrations/slack/callback' element={<SlackCallback />} />
              
              <Route path='/debug-logs' element={<DebugLogsPage />} />
            </Route>
          </Routes>
          <Toaster />
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
