import React from "react";
import ActivityFeed from "../../activePentests/subComponenets/Activities";

const ActivityFeedSection: React.FC = () => {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm h-full min-h-[500px] max-h-[800px]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Recent Activities
        </h2>
      </div>
      <div className="flex-1 overflow-hidden min-h-0">
        <ActivityFeed />
      </div>
    </div>
  );
};

export default ActivityFeedSection;
