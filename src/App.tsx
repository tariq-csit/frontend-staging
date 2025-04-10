import './App.css'
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ClientLists from './components/clientLists/ClientLists';
import PentestersList from './components/pentests/pentestersList/PentestersList';
import Settings from './components/settings/Settings';
import Login from './components/login/Login';
import SignUp from './components/signUp/SignUp';
import VulnerabilityDetails from './components/vulenerabilityReports/VulnerabilityDetails';
import PentestsList from './components/pentests/Pentests';
import DashboardHome from './components/activePentests/Dashboard';
import PentestDetails from './components/pentests/PentestDetails';
import VulnerabilitiesInPentest from './components/vulenerabilityReports/VulnerabilityDetails';
import VulnerabilityReports from './components/vulenerabilityReports/VulnerabilityReports';
import NewPentestsForm from './components/pentests/newPentestsForm/NewPentestsForm';
import ClientUsers from './components/clientLists/ClientUsers';
import ReportsForm from './components/vulenerabilityReports/subcomponents/VulnerabilityReportForm';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import FormPreview from './components/vulenerabilityReports/subcomponents/FormPreview';
import ForgotPassword from './components/login/ForgotPassword';
import ResetPassword from './components/login/ResetPassword';


function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path='/' element={<Layout />}>
          <Route path='dashboard' element={<DashboardHome />} />

          <Route path='dashboard/pentests' element={<PentestsList />} />
          <Route path='dashboard/pentests/:pentestId/' element={<PentestDetails />} />
          <Route path='dashboard/pentests/:pentestId/vulnerabilities' element={<VulnerabilitiesInPentest />} />
          <Route path='dashboard/pentests/create' element={<NewPentestsForm />} />

          <Route path='dashboard/vulnerability-reports/:pentestId/vulnerabilities/:vulnerabilityId' element={<FormPreview />} />
          <Route path='dashboard/vulnerability-reports/:pentestId' element={<VulnerabilityReports />} />
          <Route path='dashboard/vulnerability-reports/' element={<VulnerabilityReports />} />
          <Route path='dashboard/vulnerability-reports/:pentestId/create' element={<ReportsForm />} />

          <Route path='dashboard/client-lists' element={<ClientLists />} />
          <Route path='dashboard/client-lists/users' element={<ClientUsers />} />

          <Route path='dashboard/pentesters-list' element={<PentestersList />} />

          <Route path='dashboard/settings' element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
