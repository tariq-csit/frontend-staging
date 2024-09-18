import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/login/Login';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';


function App() {
  const roles = ['admin', 'pentester', 'user'];
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout/>,
      children: [
        {
          path: 'Login/',
          children: [
            {
              path: 'login',
              element: <Login/>
            }
          ]
        },
        {
          path: 'Dashboard/',
          children:[
            {
              path: 'dashboard',
              element: <Dashboard/>
            }
          ]
        }
      ]
    }
  ])



  return (
    <>
     
    </>
  )
}

export default App
