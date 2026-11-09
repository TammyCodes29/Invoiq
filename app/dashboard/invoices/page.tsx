import { getInvoices } from "@/actions/invoices"
import Link from "next/link"
import { FileText, Plus } from "lucide-react"

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-[#f0f1ed] text-[#6e7971]",
  SENT: "bg-[#edf2fa] text-[#3863a0]",
  PAID: "bg-[#eaf2ed] text-[#28644d]",
  OVERDUE: "bg-[#fbefea] text-[#aa503d]",
  CANCELLED: "bg-[#f0f1ed] text-[#6e7971]",
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
}

function sumByCurrency(invoices: Awaited<ReturnType<typeof getInvoices>>) {
  return invoices
    .filter((invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE")
    .reduce<Record<string, number>>((totals, invoice) => {
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

function formatInvoiceStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()
  const outstanding = sumByCurrency(invoices)
  const overdueCount = invoices.filter((invoice) => invoice.status === "OVERDUE").length

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase text-[#738278]">Billing</p>
          <h1 className="font-serif text-[34px] font-normal leading-tight text-[#1b3029]">Invoices</h1>
          <p className="mt-2 text-sm text-[#718078]">{invoices.length} {invoices.length === 1 ? "invoice" : "invoices"} across your clients.</p>
        </div>
        <Link href="/dashboard/invoices/new" className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-[#176c53] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#125b46] sm:self-auto">
          <Plus className="size-4" />
          Create invoice
        </Link>
      </header>

      <section aria-label="Invoice summary" className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-lg border border-[#e1e7de] bg-[#fffefa] p-5">
          <p className="text-sm font-medium text-[#68776d]">All invoices</p>
          <p className="mt-4 text-3xl font-semibold text-[#20372e]">{invoices.length}</p>
          <p className="mt-2 text-xs text-[#89948c]">Across all statuses</p>
        </article>
        <article className="rounded-lg border border-[#eaded5] bg-[#fffaf6] p-5">
          <p className="text-sm font-medium text-[#8e6d5f]">Overdue</p>
          <p className="mt-4 text-3xl font-semibold text-[#aa503d]">{overdueCount}</p>
          <p className="mt-2 text-xs text-[#9a8175]">Needs follow-up</p>
        </article>
        <article className="rounded-lg border border-[#dce8df] bg-[#f7fbf6] p-5">
          <p className="text-sm font-medium text-[#68776d]">Outstanding amount</p>
          <p className="mt-4 break-words text-2xl font-semibold text-[#20372e]">{formatCurrencyMap(outstanding)}</p>
          <p className="mt-2 text-xs text-[#89948c]">Sent and overdue invoices</p>
        </article>
      </section>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d7e1d7] bg-[#fffefa] px-5 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-lg bg-[#eaf3ec] text-[#176c53]">
            <FileText className="size-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-[#263d33]">No invoices yet</p>
          <p className="mt-1 text-sm text-[#89948c]">Create your first invoice to get started.</p>
          <Link href="/dashboard/invoices/new" className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[#176c53] px-3 text-sm font-semibold text-white hover:bg-[#125b46]">
            <Plus className="size-4" />
            Create invoice
          </Link>
        </div>
      ) : (
        <section aria-label="Invoice list" className="overflow-hidden rounded-lg border border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
          <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(130px,0.9fr)_minmax(110px,0.8fr)_minmax(140px,0.8fr)_auto] gap-4 border-b border-[#e9ede7] bg-[#f8f9f5] px-5 py-3 text-[10px] font-semibold uppercase text-[#758279] lg:grid">
            <span>Invoice</span><span>Client</span><span>Due date</span><span>Amount</span><span>Status</span>
          </div>
          <div className="divide-y divide-[#edf0eb]">
            {invoices.map((invoice) => (
              <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-4 transition-colors hover:bg-[#f8faf6] sm:px-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(130px,0.9fr)_minmax(110px,0.8fr)_minmax(140px,0.8fr)_auto] lg:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f3ed] text-[#718078] sm:flex">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#263d33]">{invoice.invoiceNumber}</p>
                    <p className="mt-0.5 truncate text-xs text-[#89948c] lg:hidden">
                      {invoice.client.name} · {invoice.lineItems[0]?.description ?? "No line items yet"}
                    </p>
                  </div>
                </div>
                <p className="hidden truncate text-sm text-[#52655a] lg:block">
                  {invoice.client.name}{invoice.client.company ? ` · ${invoice.client.company}` : ""}
                </p>
                <p className="hidden text-sm text-[#718078] lg:block">{new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                <div className="text-right lg:text-left">
                  <p className="text-sm font-semibold text-[#263d33]">{CURRENCY_SYMBOLS[invoice.currency] ?? `${invoice.currency} `}{Number(invoice.total).toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
                  <p className="mt-1 text-xs text-[#89948c] lg:hidden">Due {new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
                <span className={`col-span-2 inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold lg:col-span-1 ${STATUS_STYLES[invoice.status] ?? STATUS_STYLES.DRAFT}`}>
                  {formatInvoiceStatus(invoice.status)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}