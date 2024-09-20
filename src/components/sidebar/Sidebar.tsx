import React from 'react'
import LeftArrow from '/chevron-left.svg'
import SidebarNav from './sidebarNav'
function Sidebar() {
  const navComponents = [
    {
      link: 'test1',
      text: 'test1',
      icon: ''
    },
    {
      link: 'test1',
      text: 'test1',
      icon: ''
    },
    {
      link: 'test1',
      text: 'test1',
      icon: ''
    },
    {
      link: 'test1',
      text: 'test1',
      icon: ''
    },
    {
      link: 'test1',
      text: 'test1',
      icon: ''
    },
  ]
  return (
    <div className='flex w-[17.5rem] h-[69.8125rem] bg-orange-600 flex-col justify-between items-start shrink-0 rounded-component'>
      
      
      <div className='flex flex-col justify-center gap-6 self-stretch '>
      
        <div className='flex p-component items-center gap-[0.75rem] self-stretch'>
          <img src="https://s3-alpha-sig.figma.com/img/ad94/5481/5d171a24e5a4b76a4aaf14d9aeab94a9?Expires=1727654400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=T5PaOlxdj6TiY90j6QjZ7QK4QpF4nsfBHPbvfLFR7i0iSyEON~b1Tz-KItrFPwxgFW~d8cCht9T5427HV5CNf6nfIBr5DEORdqeVzKMWR6FjQuS2ur23B8Bet-GstgVTMV3vxD231ZVZit0YEOy93f8LiaRCrm79ogCXQUgoaFxXeZK1IXtNUwMI5q2Av1UGFlnFt~FPBfBhhFfk-L0AWMDNMKeC1WZXbpoij5XYasX-ugcFqSecr2Pv9yKzCmQTuHTGNx9NQuNNX-yWo~U7wTLaiudhfIsh50pEDpp-8qGucc2pyrRpzZLlSG3OCrF78ifwB~0Ufd0-uZM2GcKHXw__" alt="Logo" />
        <div className='bg-green-600 flex p-1 items-center gap-[0.625rem] rounded-full absolute -right-3 top-7'><img src={LeftArrow} alt="left arrow" /></div>
      
      </div>
      <div className='flex flex-col mx-auto items-end w-[14.625rem] gap-component '>

      {
        navComponents.map((nav, index)=>{
          return(
            <SidebarNav key={index} link= {nav.link} navText={nav.text} icon={nav.icon}/>
          )
        })
      }      
      </div>
      </div>
    </div>
  )
}

export default Sidebar
