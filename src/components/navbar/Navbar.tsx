import React from 'react'
import profilePic from '/Ellipse 6.svg'
import downArrow from '/all-screen-icons.svg'
import notificationBell from '/state=no-ntfcn.svg'
import ntfcnOrange from '/ntfcn=orange.svg'


function Navbar() {
  return (
    <div className='bg-orange-50 flex pl-0 pr-6 sm:pr-10 py-4 flex-col w-full h-20 justify-center items-center self-stretch border-b border-secondary bg-white shadow-component'>
      <div className='flex pl-10 justify-end items-center gap-component self-stretch'>
        <div className='flex justify-center items-center gap-5 sm:gap-8 lg:gap-[2.8125rem]'>
          <div className='flex items-center gap-3'>

          <div className='text-end'>
            <p className='text-[0.65rem] sm:text-xs lg:text-sm font-medium'>Johnathan</p>
            <p className='text-[0.525rem] sm:text-[0.65rem] lg:text-xs text-secondary font-normal'>PM,Tecessc LLC</p>
          </div>
          <img className='w-6 sm:w-8 lg:w-10' src={profilePic}/>
          <img className='w-2 sm:w-3 lg:w-4 ' src={downArrow}  />
          </div>
            <img className='w-[1.125rem] h-[1.125rem]' src={notificationBell} />
            <img className='absolute right-[3.4rem] top-[2.6rem]' src={ntfcnOrange}/>
        </div>
      </div>
    </div>
  )
}

export default Navbar
