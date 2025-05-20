import React from "react";
import { useSpring, animated } from "@react-spring/web";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Clock, BarChart4 } from "lucide-react";
import Bugs from "../../activePentests/subComponenets/Bugs";

interface PentesterMetrics {
  scheduled_pentests_count: number;
  total_assigned_pentests: number;
  average_cvss_score: string;
}

interface AdminMetrics {
  TotalClients: number;
  Ongoing: number;
  Scheduled: number;
}

interface ClientMetrics {
  ongoingPentests: number;
  scheduledPentests: number;
  totalVulnerabilities: number;
}
interface MetricsCardsProps {
  isPentester: boolean;
  isClient?: boolean;
  isLoading: boolean;
  pentesterData?: PentesterMetrics;
  adminData?: AdminMetrics;
  clientData?: ClientMetrics;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({
  isPentester,
  isClient,
  isLoading,
  pentesterData,
  adminData,
  clientData,
}) => {
  // Spring animations for metrics
  const adminAnimatedValues = {
    totalClients: useSpring({
      from: { number: 0 },
      number: adminData?.TotalClients || 0,
      config: { mass: 1, tension: 20, friction: 10 },
      immediate: isPentester || isClient,
    }),
    ongoing: useSpring({
      from: { number: 0 },
      number: adminData?.Ongoing || 0,
      config: { mass: 1, tension: 20, friction: 10 },
      immediate: isPentester || isClient,
    }),
    scheduled: useSpring({
      from: { number: 0 },
      number: adminData?.Scheduled || 0,
      config: { mass: 1, tension: 20, friction: 10 },
      immediate: isPentester || isClient,
    }),
  };

  const pentesterAnimatedValues = {
    upcoming: useSpring({
      from: { number: 0 },
      number: pentesterData?.scheduled_pentests_count || 0,
      config: { mass: 1, tension: 20, friction: 10 },
      immediate: !isPentester,
    }),
    assigned: useSpring({
      from: { number: 0 },
      number: pentesterData?.total_assigned_pentests || 0,
      config: { mass: 1, tension: 20, friction: 10 },
      immediate: !isPentester,
    }),
    cvssScore: useSpring({
      from: { number: 0 },
      number: parseFloat(pentesterData?.average_cvss_score || "0"),
      config: { mass: 1, tension: 20, friction: 10 },
      immediate: !isPentester,
    }),
  };

  const clientAnimatedValues = {
    ongoingPentests: useSpring({
      from: { number: 0 },
      number: clientData?.ongoingPentests || 0,
      config: { mass: 1, tension: 20, friction: 10 },
      immediate: !isClient,
    }),
    scheduledPentests: useSpring({
      from: { number: 0 },
      number: clientData?.scheduledPentests || 0,
      config: { mass: 1, tension: 20, friction: 10 },
      immediate: !isClient,
    }),
    totalVulnerabilities: useSpring({
      from: { number: 0 },
      number: clientData?.totalVulnerabilities || 0,
      config: { mass: 1, tension: 20, friction: 10 },
      immediate: !isClient,
    }),
  };

  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex p-2 sm:p-4 items-center sm:gap-6 flex-component rounded-component bg-white shadow-6">
            <div className="w-full flex justify-between items-center flex-component">
              <div className="flex items-center self-stretch justify-between gap-3 sm:gap-6">
                <Skeleton className="w-10 sm:w-12 lg:w-14 h-8 sm:h-10 lg:h-12 rounded-full" />
                <div className="flex flex-col items-start gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="w-6 h-6" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (isPentester) {
    return (
      <>
        <div className="bg-white p-4 rounded-component shadow-6 flex items-center">
          <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <Clock className="text-red-500" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">
              <animated.span>
                {pentesterAnimatedValues.upcoming.number.to(n => Math.floor(n))}
              </animated.span>
            </div>
            <div className="text-sm text-gray-600">Upcoming Pentests</div>
          </div>
          <ChevronRight className="text-gray-400" />
        </div>
        
        <div className="bg-white p-4 rounded-component shadow-6 flex items-center">
          <div className="bg-yellow-50 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <BarChart4 className="text-yellow-500" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">
              <animated.span>
                {pentesterAnimatedValues.assigned.number.to(n => Math.floor(n))}
              </animated.span>
            </div>
            <div className="text-sm text-gray-600">Assigned Pentest</div>
          </div>
          <ChevronRight className="text-gray-400" />
        </div>
        
        <div className="bg-white p-4 rounded-component shadow-6 flex items-center">
          <div className="bg-pink-50 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">
              <animated.span>
                {pentesterAnimatedValues.cvssScore.number.to(n => n.toFixed(1))}
              </animated.span>
            </div>
            <div className="text-sm text-gray-600">Average CVSS Score</div>
          </div>
          <ChevronRight className="text-gray-400" />
        </div>
      </>
    );
  }

  else if (isClient) {
    return (
      <>
        <div>
          <Bugs 
            icon="/Ongoing.svg" 
            num={clientData?.ongoingPentests || 0} 
            text="Ongoing Pentests" 
          >
            <animated.span>
              {clientAnimatedValues.ongoingPentests.number.to((n: number) => Math.floor(n))}
            </animated.span>
          </Bugs>
        </div>

        <div>
          <Bugs 
            icon="/Shecduled.svg" 
            num={clientData?.scheduledPentests || 0} 
            text="Scheduled Pentests" 
          >
            <animated.span>
              {clientAnimatedValues.scheduledPentests.number.to((n: number) => Math.floor(n))}
            </animated.span>
          </Bugs>
        </div>

        <div>
          <Bugs 
            icon="/Bug.svg" 
            num={clientData?.totalVulnerabilities || 0} 
            text="Total Vulnerabilities" 
          >
            <animated.span>
              {clientAnimatedValues.totalVulnerabilities.number.to((n: number) => Math.floor(n))}
            </animated.span>
          </Bugs>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <Bugs 
          icon="/Clients.svg" 
          num={adminData?.TotalClients || 0} 
          text="Clients" 
        >
          <animated.span>
            {adminAnimatedValues.totalClients.number.to(n => Math.floor(n))}
          </animated.span>
        </Bugs>
      </div>
      <div>
        <Bugs 
          icon="/Ongoing.svg" 
          num={adminData?.Ongoing || 0} 
          text="Ongoing Pentests" 
        >
          <animated.span>
            {adminAnimatedValues.ongoing.number.to(n => Math.floor(n))}
          </animated.span>
        </Bugs>
      </div>
      <div>
        <Bugs 
          icon="/Shecduled.svg" 
          num={adminData?.Scheduled || 0} 
          text="Scheduled Pentests" 
        >
          <animated.span>
            {adminAnimatedValues.scheduled.number.to(n => Math.floor(n))}
          </animated.span>
        </Bugs>
      </div>
    </>
  );
};

export default MetricsCards; 