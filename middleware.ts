import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl

  // Define public routes inline
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")

  if (!isPublic) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
}