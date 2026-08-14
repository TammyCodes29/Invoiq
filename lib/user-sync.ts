import { prisma } from "./prisma"

export async function syncUserToDatabase(
  clerkId: string,
  email: string,
  name?: string
) {
  const safeName = name?.trim() || email.split("@")[0]

  try {
    // First try to find by clerkId
    const existingByClerkId = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (existingByClerkId) {
      // User exists, update their info in case email or name changed
      return await prisma.user.update({
        where: { clerkId },
        data: { email, name: safeName },
      })
    }

    // Not found by clerkId, check if email already exists
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingByEmail) {
      // Email exists but with a different clerkId
      // Update the clerkId to the new one
      return await prisma.user.update({
        where: { email },
        data: { clerkId, name: safeName },
      })
    }

    // No existing user at all, create fresh
    return await prisma.user.create({
      data: {
        clerkId,
        email,
        name: safeName,
      },
    })

  } catch (error) {
    console.error("syncUserToDatabase failed:", error)
    throw error
  }
}