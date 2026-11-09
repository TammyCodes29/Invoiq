"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getOrCreateCurrentUser } from "@/lib/user-sync"
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
  const user = await getOrCreateCurrentUser()

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
  const user = await getOrCreateCurrentUser()

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