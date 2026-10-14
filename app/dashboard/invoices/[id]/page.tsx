import { notFound, redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getInvoiceById} from "@/actions/invoices"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { InvoiceActions } from "@/components/dashboard/invoices/InvoiceActions"
import { PayInvoiceButton } from "@/components/dashboard/invoices/PayInvoiceButton"


export const dynamic = 'force-dynamic'


type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-700 text-zinc-300",
  SENT: "bg-blue-500/20 text-blue-400",
  PAID: "bg-green-500/20 text-green-400",
  OVERDUE: "bg-red-500/20 text-red-400",
  CANCELLED: "bg-zinc-700 text-zinc-500",
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { id } = await params
  const invoice = await getInvoiceById(id)

  if (!invoice) notFound()

  const symbol = CURRENCY_SYMBOLS[invoice.currency] ?? "₦"

  function formatAmount(amount: number) {
    return `${symbol}${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard/invoices">
            <Button
              variant="ghost"
              className="mb-4 gap-2 text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to Invoices
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {invoice.invoiceNumber}
            </h1>
            <Badge className={STATUS_STYLES[invoice.status] ?? STATUS_STYLES.DRAFT}>
              {invoice.status}
            </Badge>
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            Issued {new Date(invoice.issueDate).toLocaleDateString()} · Due{" "}
            {new Date(invoice.dueDate).toLocaleDateString()}
          </p>
        </div>

        <InvoiceActions
          invoiceId={invoice.id}
          currentStatus={invoice.status}
        />

        <div className="mt-4">
          <PayInvoiceButton
            invoiceId={invoice.id}
            amount={Number(invoice.total)}
            currency={invoice.currency}
            clientEmail={invoice.client.email}
            clientName={invoice.client.name}
            clientPhone={invoice.client.phone || ""}
            invoiceNumber={invoice.invoiceNumber}
            currentStatus={invoice.status}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left column - Client info */}
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-400">
                Billed To
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold text-white">{invoice.client.name}</p>
              {invoice.client.company && (
                <p className="text-sm text-zinc-400">{invoice.client.company}</p>
              )}
              <p className="text-sm text-zinc-400">{invoice.client.email}</p>
              {invoice.client.phone && (
                <p className="text-sm text-zinc-400">{invoice.client.phone}</p>
              )}
              {invoice.client.address && (
                <p className="text-sm text-zinc-400">{invoice.client.address}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-400">
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-white">
                  {formatAmount(Number(invoice.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Tax</span>
                <span className="text-white">
                  {formatAmount(Number(invoice.tax))}
                </span>
              </div>
              <div className="border-t border-zinc-700 pt-3 flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-white">
                  {formatAmount(Number(invoice.total))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Line items */}
        <div className="lg:col-span-2">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader>
              <CardTitle className="text-white">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">

                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 pb-3 text-xs font-medium text-zinc-500 border-b border-zinc-800">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Line item rows */}
                {invoice.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 py-3 text-sm border-b border-zinc-800/50 last:border-0"
                  >
                    <div className="col-span-6 text-white">
                      {item.description}
                    </div>
                    <div className="col-span-2 text-right text-zinc-400">
                      {Number(item.quantity)}
                    </div>
                    <div className="col-span-2 text-right text-zinc-400">
                      {formatAmount(Number(item.unitPrice))}
                    </div>
                    <div className="col-span-2 text-right font-medium text-white">
                      {formatAmount(Number(item.total))}
                    </div>
                  </div>
                ))}

              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-6 rounded-lg bg-zinc-800/50 p-4">
                  <p className="mb-1 text-xs font-medium text-zinc-500">
                    Notes
                  </p>
                  <p className="text-sm text-zinc-300">{invoice.notes}</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}