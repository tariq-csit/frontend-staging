import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import rightArrow from '/Caret.svg'

type propsType={
  collapsed: boolean,
  name: string,
  image: string,
  role: string
}

function ProfileNav(props: propsType) {
  return (
    <div className='flex justify-center items-center gap-2 shrink-0 self-stretch h-[5.625rem] '>
      <Avatar>
        <AvatarImage src={props.image} alt={props.name} />
        <AvatarFallback>{props.name.charAt(0)}</AvatarFallback>
      </Avatar>
       <div className={`flex ${props.collapsed?'hidden':'visible'}`}>
         <div className='sm:w-24 lg:w-28'>
          <p className='text-xs font-poppins dark:text-gray-300'>Welcome back &#128075;</p>
          <p className='text-xs lg:text-sm font-poppins font-medium dark:text-gray-100'>{props.name}</p>
        </div>
          <img className='w-3 sm:w-5 lg:w-7 dark:invert' src={rightArrow} />
        </div>
      
      </div>
  )
}
export default ProfileNav
