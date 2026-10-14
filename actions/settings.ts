"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const settingsSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  defaultCurrency: z.enum(["NGN", "USD", "GBP"]),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
})

export async function updateSettings(formData: unknown) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) throw new Error("User not found")

  const result = settingsSchema.safeParse(formData)

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: result.data,
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function getSettings() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return null

  return {
    businessName: user.businessName || "",
    businessAddress: user.businessAddress || "",
    businessPhone: user.businessPhone || "",
    defaultCurrency: (user.defaultCurrency || "NGN") as "NGN" | "USD" | "GBP",
    bankName: user.bankName || "",
    accountName: user.accountName || "",
    accountNumber: user.accountNumber || "",
  }
}