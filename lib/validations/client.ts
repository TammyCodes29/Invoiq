import { z } from "zod"

export const clientSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .optional(),

  company: z
    .string()
    .optional(),

  address: z
    .string()
    .optional(),
})

// This derives the TypeScript type FROM the schema automatically
// You don't have to write the type separately
export type ClientFormData = z.infer<typeof clientSchema>