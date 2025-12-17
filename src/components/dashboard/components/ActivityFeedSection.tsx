import React from "react";
import ActivityFeed from "../../activePentests/subComponenets/Activities";

interface ActivityFeedSectionProps {
  compact?: boolean; // If true, uses constrained height (for admin). If false/undefined, uses original height (for client)
}

const ActivityFeedSection: React.FC<ActivityFeedSectionProps> = ({ compact = false }) => {
  // When compact, match the total height of VulnerabilityReportChart
  // VulnerabilityReportChart structure:
  //   - Container: px-3, gap-6 (24px gap)
  //   - Header: text only (~32-40px estimated)
  //   - Content: h-[300px]
  //   - Total estimated: ~356-364px
  // ActivityFeedSection structure:
  //   - Header: py-4 (16px top + 16px bottom) + text (~24px) = ~56px
  //   - Content: should fill remaining space
  //   - To match total: ~360px total height
  return (
    <div className={`flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm ${compact ? 'h-[360px]' : ''}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Recent Activities
        </h2>
      </div>
      <div className={`flex-1 ${compact ? 'overflow-hidden min-h-0' : ''}`}>
        <ActivityFeed />
      </div>
    </div>
  );
};

export default ActivityFeedSection;
