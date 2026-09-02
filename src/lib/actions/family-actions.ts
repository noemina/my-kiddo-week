"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { setActiveFamilyCookie } from "@/lib/family";

export async function setActiveFamilyAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const familyId = formData.get("familyId");
  if (typeof familyId !== "string") throw new Error("Missing family id");

  const membership = await prisma.membership.findUnique({
    where: { userId_familyId: { userId: session.user.id, familyId } },
  });
  if (!membership) throw new Error("Not a member of that family");

  await setActiveFamilyCookie(familyId);
  redirect("/planner");
}
