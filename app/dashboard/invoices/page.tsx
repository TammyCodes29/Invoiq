import { getInvoices } from "@/actions/invoices"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText, Plus } from "lucide-react"

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-700 text-zinc-300",
  SENT: "bg-blue-500/20 text-blue-400",
  PAID: "bg-green-500/20 text-green-400",
  OVERDUE: "bg-red-500/20 text-red-400",
  CANCELLED: "bg-zinc-700 text-zinc-500",
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
          </p>
        </div>

        <Link href="/dashboard/invoices/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            New Invoice
          </Button>
        </Link>
      </header>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-20 text-center">
          <FileText className="mb-4 size-10 text-zinc-600" />
          <p className="text-lg font-medium text-white">No invoices yet</p>
          <p className="mt-1 text-sm text-zinc-400">
            Create your first invoice to get started
          </p>
          <Link href="/dashboard/invoices/new" className="mt-4">
            <Button className="gap-2">
              <Plus className="size-4" />
              New Invoice
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
          <div className="divide-y divide-zinc-800">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/dashboard/invoices/${invoice.id}`}
                className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800">
                    <FileText className="size-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {invoice.client.name}
                      {invoice.client.company
                        ? ` — ${invoice.client.company}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {invoice.currency === "NGN"
                        ? "₦"
                        : invoice.currency === "USD"
                        ? "$"
                        : "£"}
                      {Number(invoice.total).toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Due{" "}
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <Badge
                    className={
                      STATUS_STYLES[invoice.status] ?? STATUS_STYLES.DRAFT
                    }
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}