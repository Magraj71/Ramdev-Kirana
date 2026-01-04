// app/orders/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-request";
import OwnerOrder from "./OwnerOrder/page";
import UserOrder from "./UserOrder/page";


export default async function OrderPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "owner") {
    return <OwnerOrder />;  // Changed to PascalCase
  }

  return <UserOrder />;  // Changed to PascalCase
}