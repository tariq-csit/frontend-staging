import React from "react";
import ActivityFeed from "../../activePentests/subComponenets/Activities";

const ActivityFeedSection: React.FC = () => {
  return (
    <div className="flex self-stretch px-3 flex-col justify-center items-center gap-2 rounded-chart bg-white dark:bg-gray-800 shadow-6 dark:shadow-gray-800">
      <div className="flex items-start pt-6 justify-between self-stretch bg-white dark:bg-gray-800">
        <h2 className="sm:text-base lg:text-lg font-poppins font-semibold dark:text-gray-200">
          Recent Activities
        </h2>
      </div>
      <ActivityFeed />
    </div>
  );
};

export default ActivityFeedSection; 