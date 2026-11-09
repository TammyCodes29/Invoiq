"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getOrCreateCurrentUser } from "@/lib/user-sync"
import { z } from "zod"

async function getCurrentUser() {
  return getOrCreateCurrentUser()
}

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Price cannot be negative"),
})

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currency: z.enum(["NGN", "USD", "GBP"]),
  notes: z.string().optional(),
  tax: z.number().min(0).max(100).default(0),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item"),
})

export async function createInvoice(formData: unknown) {
  const user = await getCurrentUser()

  const result = invoiceSchema.safeParse(formData)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  const data = result.data

  // Calculate totals
  const subtotal = data.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  const taxAmount = (subtotal * data.tax) / 100
  const total = subtotal + taxAmount

  // Generate invoice number if not provided
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      currency: data.currency,
      notes: data.notes,
      subtotal,
      tax: taxAmount,
      total,
      userId: user.id,
      clientId: data.clientId,
      lineItems: {
        create: data.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
  })

  revalidatePath("/dashboard/invoices")
  revalidatePath("/dashboard/clients")

  return { success: true, invoiceId: invoice.id }
}

export async function getInvoices() {
  const user = await getCurrentUser()

  return prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      client: {
        select: {
          name: true,
          email: true,
          company: true,
        },
      },
      lineItems: {
        select: { description: true },
        take: 1,
      },
    },
  })
}

export async function getInvoiceById(invoiceId: string) {
  const user = await getCurrentUser()

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      lineItems: true,
      payments: true,
    },
  })

  if (!invoice || invoice.userId !== user.id) return null

  return invoice
}

export async function deleteInvoice(invoiceId: string) {
  const user = await getCurrentUser()

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })

  if (!invoice || invoice.userId !== user.id) {
    return { success: false, error: "Invoice not found" }
  }

  await prisma.invoice.delete({ where: { id: invoiceId } })

  revalidatePath("/dashboard/invoices")

  return { success: true }
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
) {
  const user = await getCurrentUser()

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })

  if (!invoice || invoice.userId !== user.id) {
    return { success: false, error: "Invoice not found" }
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status },
  })

  revalidatePath("/dashboard/invoices")
  revalidatePath(`/dashboard/invoices/${invoiceId}`)

  return { success: true }
}

export async function generateInvoiceNumber(userId: string) {
  const count = await prisma.invoice.count({
    where: { userId },
  })

  const number = count + 1
  return `INV-${String(number).padStart(3, "0")}`
}

export async function getDashboardStats() {
  const user = await getCurrentUser()

  const [totalClients, invoices] = await Promise.all([
    prisma.client.count({
      where: { userId: user.id },
    }),
    prisma.invoice.findMany({
      where: { userId: user.id },
      include: {
        client: {
          select: { name: true },
        },
        lineItems: {
          select: { description: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID")
  const outstandingInvoices = invoices.filter(
    (invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE"
  )

  const revenueMap: Record<string, number> = {}
  paidInvoices.forEach((invoice) => {
    revenueMap[invoice.currency] =
      (revenueMap[invoice.currency] ?? 0) + Number(invoice.total)
  })

  const outstandingMap: Record<string, number> = {}
  outstandingInvoices.forEach((invoice) => {
    outstandingMap[invoice.currency] =
      (outstandingMap[invoice.currency] ?? 0) + Number(invoice.total)
  })

  const currentWeekStart = new Date()
  currentWeekStart.setHours(0, 0, 0, 0)
  currentWeekStart.setDate(
    currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7)
  )

  const invoiceActivity = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(currentWeekStart)
    start.setDate(start.getDate() - (5 - index) * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    return {
      label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: invoices.filter(
        (invoice) => invoice.createdAt >= start && invoice.createdAt < end
      ).length,
    }
  })

  const followUpInvoices = outstandingInvoices
    .sort((first, second) => {
      if (first.status !== second.status) {
        return first.status === "OVERDUE" ? -1 : 1
      }
      return first.dueDate.getTime() - second.dueDate.getTime()
    })
    .slice(0, 4)

  const recentInvoices = invoices.slice(0, 5)

  return {
    totalClients,
    totalInvoices: invoices.length,
    paidInvoiceCount: paidInvoices.length,
    outstandingInvoiceCount: outstandingInvoices.length,
    revenueMap,
    outstandingMap,
    recentInvoices,
    followUpInvoices,
    invoiceActivity,
  }
}