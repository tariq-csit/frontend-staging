import './App.css'
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';



function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Sidebar/>}/>
        <Route path='/login' element={<div><h1>Login Page</h1></div>}/>
        <Route path='/dashboard/:role' element={<div><h1>Dashboard</h1></div>}/>
      </Routes>
    </div>
  )
}

export default App
