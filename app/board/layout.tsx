import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth-edge";

const BOARD_ROLES = ["ADMIN", "WRITER", "COACH"];

export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("auth_token")?.value ||
    cookieStore.get("token")?.value;

  if (!token) {
    redirect("/board/login");
  }

  const payload = await verifyToken(token);

  if (!payload || !BOARD_ROLES.includes(payload.role)) {
    redirect("/board/login");
  }

  return <>{children}</>;
}
