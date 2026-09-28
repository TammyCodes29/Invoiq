import { getClients } from "@/actions/clients"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { generateInvoiceNumber } from "@/actions/invoices"
import { InvoiceBuilder } from "@/components/dashboard/invoices/InvoiceBuilder"

export default async function NewInvoicePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect("/sign-in")

  const clients = await getClients()
  const invoiceNumber = await generateInvoiceNumber(user.id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          New Invoice
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Fill in the details below to create your invoice.
        </p>
      </div>

      <InvoiceBuilder
        clients={clients}
        defaultInvoiceNumber={invoiceNumber}
      />
    </div>
  )
}