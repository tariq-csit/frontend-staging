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
import ManagePentestReport from './components/pentests/managePentest/ManagePentestReport';


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

          <Route path='/pentests' element={<PentestsList />} />
          <Route path='/pentests/:pentestId/' element={<PentestDetails />} />
          <Route path='/pentests/:pentestId/vulnerabilities' element={<VulnerabilitiesInPentest />} />
          <Route path='/pentests/create' element={<NewPentestsForm />} />

          <Route path='/pentests/:pentestId/manage-report' element={<ManagePentestReport />} />

          <Route path='/vulnerability-reports/:pentestId/vulnerabilities/:vulnerabilityId' element={<FormPreview />} />
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
    </ThemeProvider>
  )
}

export default App
