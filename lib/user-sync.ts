import { prisma } from "./prisma"
import { auth, currentUser } from "@clerk/nextjs/server"

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

export async function getOrCreateCurrentUser() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  })
  if (existingUser) return existingUser

  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error("Authenticated user not found")

  const email =
    clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress

  if (!email) throw new Error("Authenticated user has no email address")

  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ")

  try {
    return await syncUserToDatabase(userId, email, fullName || undefined)
  } catch (error) {
    const syncedUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })
    if (syncedUser) return syncedUser
    throw error
  }
}