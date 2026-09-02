"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveMembership } from "@/lib/family";

const activitySchema = z
  .object({
    kidId: z.string().min(1),
    title: z.string().min(1, "Title is required"),
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().optional(),
    location: z.string().optional(),
    category: z.string().optional(),
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional(),
  })
  .refine(
    (data) => !data.validFrom || !data.validTo || data.validFrom <= data.validTo,
    { message: "Valid-from date must be before valid-to date", path: ["validTo"] }
  );

async function assertKidBelongsToFamily(kidId: string, familyId: string) {
  const kid = await prisma.kid.findFirst({ where: { id: kidId, familyId } });
  if (!kid) throw new Error("Kid not found in this family");
}

export async function createActivityAction(formData: FormData) {
  const membership = await getActiveMembership();
  if (!membership) throw new Error("Not signed in");

  const parsed = activitySchema.safeParse({
    kidId: formData.get("kidId"),
    title: formData.get("title"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime") || undefined,
    location: formData.get("location") || undefined,
    category: formData.get("category") || undefined,
    validFrom: formData.get("validFrom") || undefined,
    validTo: formData.get("validTo") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

  await assertKidBelongsToFamily(parsed.data.kidId, membership.familyId);

  await prisma.activity.create({ data: parsed.data });

  revalidatePath("/planner");
}

export async function deleteActivityAction(formData: FormData) {
  const membership = await getActiveMembership();
  if (!membership) throw new Error("Not signed in");

  const activityId = formData.get("activityId");
  if (typeof activityId !== "string") throw new Error("Missing activity id");

  await prisma.activity.deleteMany({
    where: { id: activityId, kid: { familyId: membership.familyId } },
  });

  revalidatePath("/planner");
}
