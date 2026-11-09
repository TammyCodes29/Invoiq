import { getClients } from "@/actions/clients"
import { generateInvoiceNumber } from "@/actions/invoices"
import { InvoiceBuilder } from "@/components/dashboard/invoices/InvoiceBuilder"
import { getOrCreateCurrentUser } from "@/lib/user-sync"

type NewInvoicePageProps = {
  searchParams: Promise<{ clientId?: string }>
}

export default async function NewInvoicePage({
  searchParams,
}: NewInvoicePageProps) {
  const { clientId } = await searchParams
  const user = await getOrCreateCurrentUser()

  const clients = await getClients()
  const invoiceNumber = await generateInvoiceNumber(user.id)

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-[11px] font-semibold uppercase text-[#738278]">Billing</p>
        <h1 className="font-serif text-[34px] font-normal leading-tight text-[#1b3029]">
          New Invoice
        </h1>
        <p className="mt-2 text-sm text-[#718078]">
          Fill in the details below to create your invoice.
        </p>
      </div>

      <InvoiceBuilder
        clients={clients}
        defaultInvoiceNumber={invoiceNumber}
        defaultClientId={clientId}
      />
    </div>
  )
}