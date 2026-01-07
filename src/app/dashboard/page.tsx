import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-request";
import OwnerDashboard from "@/app/dashboard/OwnerDashboard/page";
import UserDashboard from "@/app/dashboard/UserDashboard/page";
// import {getUserIdFromReq} from "@/lib/auth"

export default async  function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "owner") {
    return <OwnerDashboard />;
  }

  return <UserDashboard />;
}
