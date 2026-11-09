import { notFound } from "next/navigation"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getClientById } from "@/actions/clients"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Building2, MapPin, Plus } from "lucide-react"
import Link from "next/link"

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

function sumByCurrency(invoices: { currency: string; total: unknown }[]) {
  return invoices.reduce<Record<string, number>>((totals, invoice) => {
    totals[invoice.currency] = (totals[invoice.currency] ?? 0) + Number(invoice.total)
    return totals
  }, {})
}

function formatCurrencyMap(totals: Record<string, number>) {
  const entries = Object.entries(totals)
  if (entries.length === 0) return "₦0"
  return entries
    .map(([currency, amount]) => `${CURRENCY_SYMBOLS[currency] ?? `${currency} `}${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`)
    .join(" · ")
}


export const dynamic = 'force-dynamic'
type ClientDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { userId } = await auth()
  const {id} = await params

  if (!userId) redirect("/sign-in")

  const client = await getClientById(id)

  if (!client) notFound()

  const totalInvoiced = sumByCurrency(
    client.invoices.filter((invoice) => invoice.status !== "CANCELLED")
  )
  const totalPaid = sumByCurrency(
    client.invoices.filter((invoice) => invoice.status === "PAID")
  )
  const outstanding = sumByCurrency(
    client.invoices.filter(
      (invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE"
    )
  )

  return (
    <div className="space-y-7">

      {/* Back button and header */}
      <div>
        <Link href="/dashboard/clients">
          <Button
            variant="ghost"
              className="mb-4 gap-2 text-[#718078] hover:bg-[#edf1ea] hover:text-[#1b483d]"
          >
            <ArrowLeft className="size-4" />
            Back to Clients
          </Button>
        </Link>

        <p className="mb-2 text-[11px] font-semibold uppercase text-[#738278]">Client profile</p>
        <h1 className="font-serif text-[34px] font-normal leading-tight text-[#1b3029]">
          {client.name}
        </h1>

        {client.company && (
          <p className="mt-2 text-sm text-[#718078]">{client.company}</p>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#68776d]">
              Total Invoiced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="break-words text-xl font-semibold text-[#20372e] sm:text-2xl">
              {formatCurrencyMap(totalInvoiced)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#68776d]">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="break-words text-xl font-semibold text-[#176c53] sm:text-2xl">
              {formatCurrencyMap(totalPaid)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#68776d]">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="break-words text-xl font-semibold text-[#aa503d] sm:text-2xl">
              {formatCurrencyMap(outstanding)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Contact info */}
        <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#233a30]">Contact details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="flex items-start gap-3 text-sm">
              <Mail className="mt-0.5 size-4 shrink-0 text-[#738278]" />
              <span className="break-all text-[#42584d]">{client.email}</span>
            </div>

            {client.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="mt-0.5 size-4 shrink-0 text-[#738278]" />
                <span className="text-[#42584d]">{client.phone}</span>
              </div>
            )}

            {client.company && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="mt-0.5 size-4 shrink-0 text-[#738278]" />
                <span className="text-[#42584d]">{client.company}</span>
              </div>
            )}

            {client.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#738278]" />
                <span className="text-[#42584d]">{client.address}</span>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Invoices list */}
        <div className="lg:col-span-2">
          <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#233a30]">Invoices</CardTitle>
             <Link href={`/dashboard/invoices/new?clientId=${client.id}`}>
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                New Invoice
              </Button>
            </Link>
            </CardHeader>

            <CardContent>
              {client.invoices.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-[#42584d]">No invoices yet</p>
                  <p className="mt-1 text-sm text-[#89948c]">
                    Create the first invoice for this client
                  </p>
                </div>
              ) : (
                <div className="-mx-6 divide-y divide-[#edf0eb]">
                  {client.invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-[#f8faf6]"
                    >
                      <div>
                        <p className="font-medium text-[#263d33]">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-[#89948c]">
                          Due {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="font-medium text-[#263d33]">
                          {CURRENCY_SYMBOLS[invoice.currency] ?? `${invoice.currency} `}{Number(invoice.total).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                        </p>
                        <StatusBadge status={invoice.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={`border-0 ${STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  )
}