"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { clientSchema } from "@/lib/validations/client"

// ─────────────────────────────────────────────────────
// HELPER: Get the current user from our DB
// We'll reuse this in every action
// ─────────────────────────────────────────────────────
async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    throw new Error("User not found in database")
  }

  return user
}

// ─────────────────────────────────────────────────────
// CREATE CLIENT
// ─────────────────────────────────────────────────────
export async function createClient(formData: unknown) {
  // 1. Get the logged in user
  const user = await getCurrentUser()

  // 2. Validate the incoming data
  const result = clientSchema.safeParse(formData)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  // 3. Create the client in the database
  await prisma.client.create({
    data: {
      ...result.data,
      userId: user.id, // link to current user
    },
  })

  // 4. Tell Next.js to refresh the clients page data
  revalidatePath("/dashboard/clients")

  return { success: true }
}

// ─────────────────────────────────────────────────────
// UPDATE CLIENT
// ─────────────────────────────────────────────────────
export async function updateClient(clientId: string, formData: unknown) {
  const user = await getCurrentUser()

  // Verify this client belongs to this user before updating
  const existing = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!existing || existing.userId !== user.id) {
    return {
      success: false,
      errors: { general: ["Client not found"] },
    }
  }

  const result = clientSchema.safeParse(formData)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  await prisma.client.update({
    where: { id: clientId },
    data: result.data,
  })

  revalidatePath("/dashboard/clients")

  return { success: true }
}

// ─────────────────────────────────────────────────────
// DELETE CLIENT
// ─────────────────────────────────────────────────────
export async function deleteClient(clientId: string) {
  const user = await getCurrentUser()

  // Verify ownership before deleting
  const existing = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!existing || existing.userId !== user.id) {
    return {
      success: false,
      error: "Client not found",
    }
  }

  await prisma.client.delete({
    where: { id: clientId },
  })

  revalidatePath("/dashboard/clients")

  return { success: true }
}

// ─────────────────────────────────────────────────────
// GET ALL CLIENTS (for the current user)
// ─────────────────────────────────────────────────────
export async function getClients() {
  const user = await getCurrentUser()

  return prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { invoices: true },
      },
    },
  })
}