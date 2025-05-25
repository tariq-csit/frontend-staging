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
    <div className='flex justify-center items-center gap-2 w-full h-[5.625rem] '>
      <Avatar>
        <AvatarImage src={props.image} alt={props.name} />
        <AvatarFallback className='dark:bg-gray-900'>{props.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className={`flex ${props.collapsed ? 'hidden' : 'visible'}`}>
        <div className=''>
          <p className='text-xs font-poppins dark:text-gray-300'>Welcome back &#128075;</p>
          <p className='text-xs lg:text-sm font-poppins font-medium dark:text-gray-100'>{props.name}</p>
        </div>
      </div>
      
      </div>
  )
}
export default ProfileNav
