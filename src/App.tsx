import './App.css'
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Pentests from './components/pentests/Pentests';
import VulnerabilityReports from './components/vulenerabilityReports/VulnerabilityReports';
import ClientLists from './components/clientLists/ClientLists';
import PentestersList from './components/pentestersList/PentestersList';
import Settings from './components/settings/Settings';
import ActivePentests from './components/activePentests/ActivePentests';
import Login from './components/login/Login';


function App() {
  return (
    <div>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/' element={<Layout/>} 
        <Route path='dashboard' element={<ActivePentests/>}/>
        <Route path='dashboard/pentests' element={<Pentests/>}/>
        <Route path='dashboard/vulnerability-reports' element={<VulnerabilityReports/>}/>
        <Route path='dashboard/client-lists' element={<ClientLists/>}/>
        <Route path='dashboard/pentesters-list' element={<PentestersList/>}/>
        <Route path='dashboard/settings' element={<Settings/>}/>
        </Route>
      </Routes>
    </div>
  )
}

export default App
