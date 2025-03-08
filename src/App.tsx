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
import DashboardHome from './components/activePentests/ActivePentests';
import PentestDetails from './components/pentests/PentestDetails';
import VulnerabilitiesInPentest from './components/vulenerabilityReports/VulnerabilityDetails';
import VulnerabilityReports from './components/vulenerabilityReports/VulnerabilityReports';
import NewPentestsForm from './components/pentests/newPentestsForm/NewPentestsForm';


function App() {
  return (
    <div>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/' element={<Layout/>}>
          <Route path='dashboard' element={<DashboardHome/>}/>

          <Route path='dashboard/pentests' element={<PentestsList/>}/>
          <Route path='dashboard/pentests/:pentestId/' element={<PentestDetails/>}/>
          <Route path='dashboard/pentests/:pentestId/vulnerabilities' element={<VulnerabilitiesInPentest/>}/>
          <Route path='dashboard/pentests/create' element={<NewPentestsForm/>}/>

          <Route path='dashboard/vulnerability-reports/:pentestId/vulnerabilities/:vulnerabilityId' element={<VulnerabilityDetails/>}/>
          <Route path='dashboard/vulnerability-reports/:pentestId' element={<VulnerabilityReports/>}/>
          <Route path='dashboard/vulnerability-reports/' element={<VulnerabilityReports/>}/>

          <Route path='dashboard/client-lists' element={<ClientLists/>}/>

          <Route path='dashboard/pentesters-list' element={<PentestersList/>}/>

          <Route path='dashboard/settings' element={<Settings/>}/>
        </Route>
      </Routes>
    </div>
  )
}

export default App
