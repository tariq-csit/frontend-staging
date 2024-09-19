import React from 'react'
import { createBrowserRouter } from 'react-router-dom';

function Routes() {
  const router = createBrowserRouter([
    {
      path: '/',
      children: [
        {
          path: 'login',
        },
        {
            path: 'dashboard:role',
        }
      ]
    }
  ])
  return (
    <div>
      
    </div>
  )
}

export default Routes
