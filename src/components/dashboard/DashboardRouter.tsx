import { useUser } from "@/hooks/useUser";
import DashboardHome from "./Dashboard";
import Dashboard1 from "./Dashboard1";

function DashboardRouter() {
  const { user, loading, isClient } = useUser();

  if (loading) {
    return null;
  }

  // For client users, show Dashboard1 (the new tab-based layout)
  if (isClient()) {
    return <Dashboard1 />;
  }

  // For admin and pentester, show the original DashboardHome
  return <DashboardHome />;
}

export default DashboardRouter;

