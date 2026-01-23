import { AppShell } from "@/app/components/app-shell";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const hasAny = await prisma.userPractice.findFirst({
    where: { userId: user.id },
    select: { userId: true },
  });
  if (!hasAny) redirect("/onboarding");

  return <AppShell>{children}</AppShell>;
}


