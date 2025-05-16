import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ClientLists from './components/clientLists/ClientLists';
import DashboardHome from '@/components/dashboard/Dashboard';
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
import RouteGuard from './components/RouteGuard';
import { UserRole } from './hooks/useUser';
import ReportsForm from '@/components/vulenerabilityReports/subcomponents/VulnerabilityReportForm';
import { ThemeProvider } from './components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  usePageTitle('Slash - Security Dashboard');
  const queryClient = new QueryClient();
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password/:token' element={<ResetPassword />} />
            <Route path='/' element={<Layout />}>
              <Route index element={<Root />} />
              <Route path='dashboard' element={<DashboardHome />} />

              <Route path='/pentests' element={<PentestsList />} />
              <Route path='/pentests/:pentestId/' element={<PentestDetails />} />
              <Route path='/pentests/:pentestId/edit' element={<NewPentestsForm />} />
              <Route path='/pentests/:pentestId/vulnerabilities' element={<VulnerabilitiesInPentest />} />
              <Route path='/pentests/create' element={<NewPentestsForm />} />

              <Route path='/pentests/:pentestId/manage-report' element={<ManagePentestReport />} />
              <Route path='/pentests/:pentestId/pentest-report' element={<PentestReport />} />
              <Route path='/pentests/:pentestId/retest-report' element={<RetestReport />} />

              <Route path='/vulnerability-reports/:pentestId/vulnerabilities/:vulnerabilityId' element={<FormPreview />} />
              <Route path='/vulnerability-reports/:pentestId/vulnerabilities/:vulnerabilityId/edit' element={<VulnerabilityReportForm />} />
              <Route path='/vulnerability-reports/:pentestId' element={<VulnerabilityReports />} />
              <Route path='/vulnerability-reports/' element={<VulnerabilityReports />} />
              <Route path='/vulnerability-reports/:pentestId/create' element={<ReportsForm />} />

              <Route path='/clients' element={<ClientLists />} />
              <Route path='/clients/users' element={<ClientUsers />} />

              <Route path='/pentesters' element={<PentestersList />} />

              <Route path='/settings' element={<Settings />} />
            </Route>
          </Routes>
          <Toaster />
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
