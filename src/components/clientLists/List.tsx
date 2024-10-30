function List() {
  const listHeader = [
    "Contract Tenure",
    "No. of Pentests",
    "Service",
    "Client Team",
  ];
  const listData = [
    {
      clientName: "Jonathan Roy",
      tenure: "6 years",
      pentestsNo: 100,
      service: "Cloud",
      team: 35,
      grayBg: false
    },
    {
      clientName: "Jonathan Roy",
      tenure: "6 years",
      pentestsNo: 100,
      service: "cloud",
      team: 35,
      grayBg: true
    },
    {
      clientName: "Mac Smith",
      tenure: "6 years",
      pentestsNo: 100,
      service: "Mobile App",
      team: 35,
      grayBg: false
    },
    {
      clientName: "Jonathan Roy",
      tenure: "2 years",
      pentestsNo: 100,
      service: "cloud",
      team: 35,
      grayBg: true
    },
    {
      clientName: "Jonathan Roy",
      tenure: "6 years",
      pentestsNo: 100,
      service: "Web App",
      team: 35,
      grayBg: false
    },
    {
      clientName: "Jonathan Roy",
      tenure: "4 years",
      pentestsNo: 80,
      service: "cloud",
      team: 35,
      grayBg: false
    },
    {
      clientName: "Jonathan Roy",
      tenure: "6 years",
      pentestsNo: 100,
      service: "cloud",
      team: 35,
      grayBg: true
    },
    {
      clientName: "Jonathan Roy",
      tenure: "6 years",
      pentestsNo: 20,
      service: "Network",
      team: 35,
      grayBg: false
    },
  ];
  return (
    <div className="flex flex-col self-stretch min-w-[1000px]">
      <div className="grid grid-cols-7 rounded-activity border-b ">
        <div className="flex h-tableVarients col-span-3 p-listItem items-center gap-listItem self-stretch flex-component">
          <p className="flex-component font-poppins text-sm">Client Name</p>
        </div>
        {listHeader.map((title, i) => {
          return (
            <div
              key={i}
              className="flex h-tableVarients w-44 p-listItem items-center gap-listItem self-stretch flex-component"
            >
              <p className="flex-component font-poppins text-sm">{title}</p>
            </div>
          );
        })}
      </div>
      {
        listData.map((item, i)=>{
          return(
            <div className={`grid grid-cols-7 rounded-activity ${item.grayBg && 'bg-[#FAFAFB]'}`}>
              <div
              key={i}
              className="flex h-tableVarients col-span-3 w-44 p-listItem items-center gap-listItem self-stretch flex-component"
            >
              <img className="w-10 h-10" src="/Ellipse 6.svg" />
              <p className="flex-component text-primary-900 font-poppins text-sm">{item.clientName}</p>
            </div>
            <div className="flex h-[3.75rem] p-listItem items-center gap-listItem self-stretch">
            <p className="flex-component font-poppins text-sm">{item.tenure}</p>
            </div>
            <div className="flex h-[3.75rem] p-listItem items-center gap-listItem self-stretch">
            <p className="flex-component font-poppins text-sm">{item.pentestsNo}</p>
            </div>
            <div className="flex h-[3.75rem] p-listItem items-center gap-listItem self-stretch">
              <div className="flex py-1 px-listItem justify-center items-center gap-listItem rounded-[0.25rem] bg-[#5D5D5D26]/15">
                <p className="text-[#5D5D5D] font-inter text-sm font-medium">{item.service}</p>
              </div>
            </div>
            <div className="flex h-[3.75rem] p-listItem items-center gap-listItem self-stretch">
                  <img className="w-8 h-team rounded-full border border-white" src={'/Ellipse 6.svg'} />
                  <img className="w-8 -ml-7 h-team rounded-full border border-white" src={'/Ellipse 6.svg'} />
                  <img className="w-8 -ml-7 h-team rounded-full border border-white" src={'/Ellipse 6.svg'} />
                  <div className={`flex justify-center items-center w-8 -ml-7 h-team rounded-full bg-primary-900 border border-white`}>
                    <p className="text-2xs font-poppins font-normal text-white">{`+${item.team}`}</p>
                  </div>
            </div>
            </div>
          )
        })
      }
    </div>
  );
}

export default List;
