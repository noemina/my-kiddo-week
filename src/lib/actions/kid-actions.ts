"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveMembership } from "@/lib/family";

const kidSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color"),
});

export async function createKidAction(formData: FormData) {
  const membership = await getActiveMembership();
  if (!membership) throw new Error("Not signed in");

  const parsed = kidSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

  await prisma.kid.create({
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
      familyId: membership.familyId,
    },
  });

  revalidatePath("/planner");
  revalidatePath("/kids");
}

export async function deleteKidAction(formData: FormData) {
  const membership = await getActiveMembership();
  if (!membership) throw new Error("Not signed in");

  const kidId = formData.get("kidId");
  if (typeof kidId !== "string") throw new Error("Missing kid id");

  await prisma.kid.deleteMany({
    where: { id: kidId, familyId: membership.familyId },
  });

  revalidatePath("/planner");
  revalidatePath("/kids");
}
