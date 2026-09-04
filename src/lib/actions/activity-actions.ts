"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getActiveMembership } from "@/lib/family";

const activitySchema = z
  .object({
    kidIds: z.array(z.string().min(1)).min(1),
    title: z.string().min(1),
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z.string().min(1),
    endTime: z.string().optional(),
    location: z.string().optional(),
    category: z.string().optional(),
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional(),
    includeInTypicalWeek: z.boolean(),
  })
  .refine((data) => !data.validFrom || !data.validTo || data.validFrom <= data.validTo, {
    message: "validityRange",
    path: ["validTo"],
  });

async function assertKidsBelongToFamily(kidIds: string[], familyId: string) {
  const count = await prisma.kid.count({ where: { id: { in: kidIds }, familyId } });
  if (count !== kidIds.length) throw new Error("Kid not found in this family");
}

export async function createActivityAction(formData: FormData) {
  const membership = await getActiveMembership();
  if (!membership) throw new Error("Not signed in");

  const parsed = activitySchema.safeParse({
    kidIds: formData.getAll("kidIds"),
    title: formData.get("title"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime") || undefined,
    location: formData.get("location") || undefined,
    category: formData.get("category") || undefined,
    validFrom: formData.get("validFrom") || undefined,
    validTo: formData.get("validTo") || undefined,
    includeInTypicalWeek: formData.get("includeInTypicalWeek") === "on",
  });
  if (!parsed.success) {
    const t = await getTranslations("PlannerErrors");
    const path = parsed.error.issues[0]?.path[0];
    const key = path === "kidIds" ? "kidRequired" : path === "validTo" ? "validityRange" : "invalidInput";
    throw new Error(t(key));
  }

  await assertKidsBelongToFamily(parsed.data.kidIds, membership.familyId);

  const { kidIds, ...data } = parsed.data;
  await prisma.activity.create({
    data: { ...data, kids: { connect: kidIds.map((id) => ({ id })) } },
  });

  revalidatePath("/planner");
}

export async function deleteActivityAction(formData: FormData) {
  const membership = await getActiveMembership();
  if (!membership) throw new Error("Not signed in");

  const activityId = formData.get("activityId");
  if (typeof activityId !== "string") throw new Error("Missing activity id");

  await prisma.activity.deleteMany({
    where: { id: activityId, kids: { some: { familyId: membership.familyId } } },
  });

  revalidatePath("/planner");
}
