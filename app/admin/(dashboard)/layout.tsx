import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminHeader } from "@/components/admin/layout/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const user = await getUserFromToken(token);

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <AdminHeader user={user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
