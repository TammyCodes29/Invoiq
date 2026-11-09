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
  DRAFT: "bg-[#f0f1ed] text-[#6e7971]",
  SENT: "bg-[#edf2fa] text-[#3863a0]",
  PAID: "bg-[#eaf2ed] text-[#28644d]",
  OVERDUE: "bg-[#fbefea] text-[#aa503d]",
  CANCELLED: "bg-[#f0f1ed] text-[#6e7971]",
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
            <p className="mb-1 text-[11px] font-semibold uppercase text-[#738278]">Invoice detail</p>
          <Link href="/dashboard/invoices">
            <Button
              variant="ghost"
                className="mb-3 gap-2 text-[#718078] hover:bg-[#edf1ea] hover:text-[#1b483d]"
            >
              <ArrowLeft className="size-4" />
              Back to Invoices
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="font-serif text-[30px] font-normal tracking-tight text-[#1b3029] sm:text-[34px]">
              {invoice.invoiceNumber}
            </h1>
            <Badge className={`border-0 ${STATUS_STYLES[invoice.status] ?? STATUS_STYLES.DRAFT}`}>
              {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
            </Badge>
          </div>

          <p className="mt-2 text-sm text-[#718078]">
            Issued {new Date(invoice.issueDate).toLocaleDateString()} · Due{" "}
            {new Date(invoice.dueDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <InvoiceActions
            invoiceId={invoice.id}
            currentStatus={invoice.status}
          />
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
          <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#68776d]">
                Billed to
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold text-[#263d33]">{invoice.client.name}</p>
              {invoice.client.company && (
                <p className="text-sm text-[#718078]">{invoice.client.company}</p>
              )}
              <p className="break-all text-sm text-[#718078]">{invoice.client.email}</p>
              {invoice.client.phone && (
                <p className="text-sm text-[#718078]">{invoice.client.phone}</p>
              )}
              {invoice.client.address && (
                <p className="text-sm text-[#718078]">{invoice.client.address}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#68776d]">
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#718078]">Subtotal</span>
                <span className="text-[#42584d]">
                  {formatAmount(Number(invoice.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#718078]">Tax</span>
                <span className="text-[#42584d]">
                  {formatAmount(Number(invoice.tax))}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#e1e7de] pt-3">
                <span className="font-semibold text-[#263d33]">Total</span>
                <span className="text-xl font-bold text-[#20372e]">
                  {formatAmount(Number(invoice.total))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Line items */}
        <div className="lg:col-span-2">
          <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[#233a30]">Line items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">

                {/* Table header */}
                <div className="hidden grid-cols-12 gap-4 border-b border-[#e9ede7] pb-3 text-[10px] font-semibold uppercase text-[#758279] sm:grid">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Line item rows */}
                {invoice.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[0.8fr_1.1fr_1.1fr] gap-3 border-b border-[#edf0eb] py-3 text-sm last:border-0 sm:grid-cols-12 sm:gap-4"
                  >
                    <div className="col-span-3 break-words text-[#263d33] sm:col-span-6">
                      {item.description}
                    </div>
                    <div className="flex flex-col gap-1 text-[#718078] sm:col-span-2 sm:text-right">
                      <span className="text-[10px] text-[#89948c] sm:hidden">Qty</span>
                      {Number(item.quantity)}
                    </div>
                    <div className="flex flex-col gap-1 break-words text-[#718078] sm:col-span-2 sm:text-right">
                      <span className="text-[10px] text-[#89948c] sm:hidden">Unit price</span>
                      {formatAmount(Number(item.unitPrice))}
                    </div>
                    <div className="flex flex-col gap-1 break-words font-medium text-[#263d33] sm:col-span-2 sm:text-right">
                      <span className="text-[10px] text-[#89948c] sm:hidden">Total</span>
                      {formatAmount(Number(item.total))}
                    </div>
                  </div>
                ))}

              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-6 rounded-lg bg-[#f3f5ef] p-4">
                  <p className="mb-1 text-xs font-medium text-[#758279]">
                    Notes
                  </p>
                  <p className="text-sm text-[#42584d]">{invoice.notes}</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}