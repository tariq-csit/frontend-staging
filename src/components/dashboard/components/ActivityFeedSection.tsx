import React from "react";
import ActivityFeed from "../../activePentests/subComponenets/Activities";

const ActivityFeedSection: React.FC = () => {
  return (
    <div className="flex self-stretch px-3 flex-col justify-center items-center gap-2 rounded-chart bg-white shadow-6">
      <div className="flex items-start pt-6 justify-between self-stretch bg-white">
        <h2 className="sm:text-base lg:text-lg font-poppins font-semibold">
          Recent Activities
        </h2>
      </div>
      <ActivityFeed />
    </div>
  );
};

export default ActivityFeedSection; 