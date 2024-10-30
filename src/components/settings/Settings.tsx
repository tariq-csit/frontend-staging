import { Link } from "react-router-dom";

function Settings() {
  const userManagementLinks=[
    {
      text: 'Authentication settings',
      link: '/dashboard/settings'
    },
    {
      text: 'Client management settings',
      link: '/dashboard/settings'
    },
    {
      text: 'Pentester management settings',
      link: '/dashboard/settings'
    },
    {
      text: 'User activities and logs',
      link: '/dashboard/settings'
    },
  ];

  const notificationsLink= [
    {
      text: 'Vulnerability alerts',
      link: '/dashboard/settings'
    },
    {
      text: 'Pentests completion notifications',
      link: '/dashboard/settings'
    },
  ]

  const DataPrivacyLinks=[
    {
      text: 'Data retention and deletion',
      link: '/dashboard/settings'
    },
    {
      text: 'Privacy policy management',
      link: '/dashboard/settings'
    },
    {
      text: 'Compliance and legal requests',
      link: '/dashboard/settings'
    },
    {
      text: 'Encryption and data security',
      link: '/dashboard/settings'
    },
  ];
  const sections=[
    {
      settingHeading: true,
      heading: 'User Management',
      links: userManagementLinks
    }, 
    {
      heading: 'User Management',
      links: notificationsLink
    }, 
    {
      heading: 'User Management',
      links: DataPrivacyLinks
    }, 
  ]
  return (
    <div className='flex flex-col px-5 sm:px-10 items-start gap-component shrink-0 self-stretch'>
      {
        sections.map((section, i)=>{
          return(
            <div key={i} className='flex p-component flex-col items-start gap-settingSection self-stretch rounded-settingsSection bg-white shadow-6'>
        
        <div className="flex flex-col items-start gap-component self-stretch">
          {section.settingHeading && <h4 className="self-stretch font-poppins text-xl sm:text-2xl font-medium">Settings</h4>}
          <h5 className="self-stretch font-poppins sm:text-xl font-medium">{section.heading}</h5>
        </div>

        {
          section.links.map((link, i)=>{
            return(
              <Link key={i} className="flex p-3 justify-between items-center self-stretch border-b border-[#77887733]/20" to={link.link}>
                <span className="text-xs sm:text-base font-poppins">{link.text}</span>
                <img src="/arrow.svg" />
              </Link>
            )
          })
        }
      </div>
          )
        })
      }
            
    </div>
  )
}

export default Settings
