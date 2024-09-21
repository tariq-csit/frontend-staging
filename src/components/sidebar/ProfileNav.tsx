import React from 'react'
import profileImage from '/Ellipse 6.svg'
import rightArrow from '/Caret.svg'

function ProfileNav(props) {
  return (
    <div className='flex justify-center items-center gap-nav shrink-0 self-stretch h-[5.625rem] bg-orange-50'>
      <img src={profileImage} alt="" />
       <div className={`flex ${props.collapsed?'scale-0':''}`}>
         <div>
          <p className='text-[0.725rem]'>Welcome back &#128075;</p>
          <p className='text-sm font-medium'>Jonathan</p>
        </div>
          <img src={rightArrow} />
        </div>
      
      </div>
  )
}
export default ProfileNav
