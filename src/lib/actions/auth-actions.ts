"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

const registerSchema = z.object({
  familyName: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

function registerErrorCode(issues: z.ZodIssue[]): string {
  switch (issues[0]?.path[0]) {
    case "familyName":
      return "familyNameRequired";
    case "name":
      return "nameRequired";
    case "email":
      return "emailInvalid";
    case "password":
      return "passwordTooShort";
    default:
      return "invalidInput";
  }
}

export async function registerAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = registerSchema.safeParse({
    familyName: formData.get("familyName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: registerErrorCode(parsed.error.issues) };
  }

  const { familyName, name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "emailTaken" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.family.create({
    data: {
      name: familyName,
      users: {
        create: {
          role: "PARENT",
          user: {
            create: { email, name, passwordHash },
          },
        },
      },
    },
  });

  await signIn("credentials", { email, password, redirectTo: "/planner" });
  return {};
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function loginErrorCode(issues: z.ZodIssue[]): string {
  switch (issues[0]?.path[0]) {
    case "email":
      return "emailInvalid";
    case "password":
      return "passwordRequired";
    default:
      return "invalidInput";
  }
}

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: loginErrorCode(parsed.error.issues) };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/planner",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "invalidCredentials" };
    }
    throw error;
  }

  return {};
}
