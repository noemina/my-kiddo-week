import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ACTIVE_FAMILY_COOKIE = "activeFamilyId";

export async function getActiveMembership() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { family: true },
    orderBy: { joinedAt: "asc" },
  });
  if (memberships.length === 0) return null;

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_FAMILY_COOKIE)?.value;

  return memberships.find((m) => m.familyId === activeId) ?? memberships[0];
}

export async function getMembershipsForCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { family: true },
    orderBy: { joinedAt: "asc" },
  });
}

export async function setActiveFamilyCookie(familyId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_FAMILY_COOKIE, familyId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}
