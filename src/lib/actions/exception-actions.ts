"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getActiveMembership } from "@/lib/family";

const exceptionSchema = z.object({
  kidIds: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
  date: z.coerce.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
});

async function assertKidsBelongToFamily(kidIds: string[], familyId: string) {
  const count = await prisma.kid.count({ where: { id: { in: kidIds }, familyId } });
  if (count !== kidIds.length) throw new Error("Kid not found in this family");
}

export async function createExceptionAction(formData: FormData) {
  const membership = await getActiveMembership();
  if (!membership) throw new Error("Not signed in");

  const parsed = exceptionSchema.safeParse({
    kidIds: formData.getAll("kidIds"),
    title: formData.get("title"),
    date: formData.get("date"),
    startTime: formData.get("startTime") || undefined,
    endTime: formData.get("endTime") || undefined,
    location: formData.get("location") || undefined,
    notes: formData.get("notes") || undefined,
    category: formData.get("category") || undefined,
  });
  if (!parsed.success) {
    const t = await getTranslations("PlannerErrors");
    const path = parsed.error.issues[0]?.path[0];
    throw new Error(path === "kidIds" ? t("kidRequired") : t("invalidInput"));
  }

  await assertKidsBelongToFamily(parsed.data.kidIds, membership.familyId);

  const { kidIds, ...data } = parsed.data;
  await prisma.activityException.create({
    data: { ...data, kids: { connect: kidIds.map((id) => ({ id })) } },
  });

  revalidatePath("/planner");
}

export async function deleteExceptionAction(formData: FormData) {
  const membership = await getActiveMembership();
  if (!membership) throw new Error("Not signed in");

  const exceptionId = formData.get("exceptionId");
  if (typeof exceptionId !== "string") throw new Error("Missing exception id");

  await prisma.activityException.deleteMany({
    where: { id: exceptionId, kids: { some: { familyId: membership.familyId } } },
  });

  revalidatePath("/planner");
}
