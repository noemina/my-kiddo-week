"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveMembership } from "@/lib/family";

const exceptionSchema = z.object({
  kidId: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  date: z.coerce.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
});

export async function createExceptionAction(formData: FormData) {
  const membership = await getActiveMembership();
  if (!membership) throw new Error("Not signed in");

  const parsed = exceptionSchema.safeParse({
    kidId: formData.get("kidId"),
    title: formData.get("title"),
    date: formData.get("date"),
    startTime: formData.get("startTime") || undefined,
    endTime: formData.get("endTime") || undefined,
    location: formData.get("location") || undefined,
    notes: formData.get("notes") || undefined,
    category: formData.get("category") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

  const kid = await prisma.kid.findFirst({
    where: { id: parsed.data.kidId, familyId: membership.familyId },
  });
  if (!kid) throw new Error("Kid not found in this family");

  await prisma.activityException.create({ data: parsed.data });

  revalidatePath("/planner");
}

export async function deleteExceptionAction(formData: FormData) {
  const membership = await getActiveMembership();
  if (!membership) throw new Error("Not signed in");

  const exceptionId = formData.get("exceptionId");
  if (typeof exceptionId !== "string") throw new Error("Missing exception id");

  await prisma.activityException.deleteMany({
    where: { id: exceptionId, kid: { familyId: membership.familyId } },
  });

  revalidatePath("/planner");
}
