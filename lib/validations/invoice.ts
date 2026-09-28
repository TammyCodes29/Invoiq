import { z } from "zod";

export const invoiceSchema = z.object({
    clientId:z.string().min(1, "Select a  client"),
    issueDate: z.string(),
    dueDate: z.string(),
    currency: z.enum(["NGN", "USD", "EUR", "GBP"], "Invalid currency"),
    notes: z.string().optional(),
    lineItems: z.array(
        z.object({
            description: z.string().min(1, "Description is required"),
            quantity: z.number().min(0, "Quantity must be at least 0"),
            unitPrice: z.number().min(0, "Unit price must be at least 0"),
        })
    )
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>;