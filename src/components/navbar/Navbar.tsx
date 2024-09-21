import React from 'react'
import profilePic from '/Ellipse 6.svg'
import downArrow from '/all-screen-icons.svg'
import notificationBell from '/state=no-ntfcn.svg'
import ntfcnOrange from '/ntfcn=orange.svg'


function Navbar() {
  return (
    <div className='flex pl-0 pr-6 sm:pr-10  py-4 flex-col w-full h-12 justify-center items-center self-stretch border-b border-secondary bg-white shadow-component'>
      <div className='flex pl-10 justify-end items-center gap-component self-stretch'>
        <div className='flex justify-center items-center gap-5 sm:gap-8 lg:gap-[2.8125rem]'>
          <div className='flex items-center gap-3'>

          <div className='text-end'>
            <p className='text-xxxs sm:text-xxs lg:text-xs font-medium'>Johnathan</p>
            <p className='text-xxxxs sm:text-xxxs lg:text-xxs text-secondary font-normal'>PM,Tecessc LLC</p>
          </div>
          <img className='w-4 sm:w-5 lg:w-7' src={profilePic}/>
          <img className='w-1 sm:w-2 lg:w-3 ' src={downArrow}  />
          </div>
            <img className='w-3 sm:w-[1.125rem] h-[1.125rem]' src={notificationBell} />
            <img className='absolute right-8 sm:right-[3.4rem] top-[1.6rem]' src={ntfcnOrange}/>
        </div>
      </div>
    </div>
  )
}

export default Navbar
