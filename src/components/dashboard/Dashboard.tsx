import React from 'react'
import AdminDashboard from './AdminDashboard'
import PentesterDashboard from './PentesterDashboard'
import UserDashboard from './UserDashboard'

function Dashboard(props) {
  
      {
          if(props.role === 'admin'){
            return <AdminDashboard/>
          }
          else if(props.role === 'pentester'){
            return <PentesterDashboard/>
          }
          else{
            return <UserDashboard/>
          }
        }
  
}

export default Dashboard
