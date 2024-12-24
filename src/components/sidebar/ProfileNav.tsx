import rightArrow from '/Caret.svg'

type propsType={
  collapsed: boolean,
  name: string,
  image: string,
  role: string
}

function ProfileNav(props: propsType) {
  return (
    <div className='flex justify-center items-center gap-2 py-3 shrink-0 self-stretch h-[5.625rem] '>
      <img className='w-10' src={props.image} />
       <div className={`flex ${props.collapsed?'hidden':'visible'}`}>
         <div className='sm:w-24 lg:w-28'>
          <p className='text-xs font-poppins'>Welcome back &#128075;</p>
          <p className='text-xs lg:text-sm font-poppins font-medium'>Jonathan</p>
        </div>
          <img className='w-3 sm:w-5 lg:w-7' src={rightArrow} />
        </div>
      
      </div>
  )
}
export default ProfileNav
