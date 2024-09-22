import React from 'react'
import profileImage from '/Ellipse 6.svg'
import rightArrow from '/Caret.svg'

type propsType={
  collapsed: boolean,
}

function ProfileNav(props: propsType) {
  return (
    <div className='flex justify-center items-center gap-nav shrink-0 self-stretch h-[5.625rem] '>
      <img className='w-6 sm:w-8 lg:w-10' src={profileImage} alt="" />
       <div className={`flex ${props.collapsed?'hidden':'visible'}`}>
         <div className='w-20 sm:w-24 lg:w-28'>
          <p className='text-xxxs sm:text-xxs lg:text-xs'>Welcome back &#128075;</p>
          <p className='text-xxs sm:text-xs lg:text-sm font-medium'>Jonathan</p>
        </div>
          <img className='w-3 sm:w-5 lg:w-7' src={rightArrow} />
        </div>
      
      </div>
  )
}
export default ProfileNav
