"use server"

import { Resend } from "resend"
import { getInvoiceById } from "./invoices"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvoiceReminder(invoiceId: string) {
  // 1. Get the invoice details
  const invoice = await getInvoiceById(invoiceId)

  if (!invoice) {
    return { success: false, error: "Invoice not found." }
  }

  try {
    // 2. Send the email
    await resend.emails.send({
      // IMPORTANT: Resend free tier requires this specific sender email
      // until you verify your own domain.
      from: "Acme Corp <onboarding@resend.dev>",
      to: [invoice.client.email],
      subject: `Reminder: Invoice ${invoice.invoiceNumber} is due`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${invoice.client.name},</h2>
          <p>This is a friendly reminder that invoice <strong>${invoice.invoiceNumber}</strong> is due on <strong>${new Date(invoice.dueDate).toLocaleDateString()}</strong>.</p>
          
          <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;">Amount Due: <strong>₦${Number(invoice.total).toLocaleString()}</strong></p>
          </div>

          <p>If you have already sent the payment, please disregard this email.</p>
          
          <p>Best regards,<br/>Your Business Name</p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Email error:", error)
    return { success: false, error: "Failed to send email." }
  }
}