import Link from "next/link"
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  FileText,
  Plus,
  Sparkles,
  Users,
} from "lucide-react"

import { getDashboardStats } from "@/actions/invoices"

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

function formatCurrencyMap(map: Record<string, number>) {
  const entries = Object.entries(map)
  if (entries.length === 0) return "₦0"

  return entries
    .map(([currency, amount]) => {
      const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `
      return `${symbol}${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
    })
    .join(" · ")
}

function formatInvoiceStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const maxActivity = Math.max(...stats.invoiceActivity.map((week) => week.count), 1)

  const metrics = [
    {
      label: "Paid invoices",
      value: formatCurrencyMap(stats.revenueMap),
      note: `${stats.paidInvoiceCount} paid ${stats.paidInvoiceCount === 1 ? "invoice" : "invoices"}`,
      icon: ArrowUpRight,
      tone: "bg-[#e8f4ec] text-[#13745a]",
    },
    {
      label: "Total clients",
      value: stats.totalClients.toLocaleString(),
      note: "In your workspace",
      icon: Users,
      tone: "bg-[#edf2fa] text-[#3863a0]",
    },
    {
      label: "Outstanding",
      value: formatCurrencyMap(stats.outstandingMap),
      note: `${stats.outstandingInvoiceCount} ${stats.outstandingInvoiceCount === 1 ? "invoice" : "invoices"} awaiting payment`,
      icon: ArrowDownRight,
      tone: "bg-[#fbefea] text-[#bf624c]",
    },
  ]

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase text-[#738278]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <h1 className="font-serif text-[34px] font-normal leading-tight text-[#1b3029] sm:text-[40px]">
            Good morning
          </h1>
          <p className="mt-2 text-sm text-[#718078]">
            Here&apos;s the latest from your business.
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-[#176c53] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#125b46] sm:self-auto"
        >
          <Plus className="size-4" />
          Create invoice
        </Link>
      </header>

      <section aria-label="Business summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <article
              key={metric.label}
              className="rounded-lg border border-[#e1e7de] bg-[#fffefa] p-5 shadow-[0_1px_2px_rgba(27,47,41,0.03)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-[#68776d]">{metric.label}</p>
                <span className={`flex size-9 items-center justify-center rounded-lg ${metric.tone}`}>
                  <Icon className="size-[18px]" />
                </span>
              </div>
              <p className="mt-5 break-words text-[28px] font-semibold leading-tight text-[#20372e] sm:text-[32px]">
                {metric.value}
              </p>
              <p className="mt-3 text-xs text-[#89948c]">{metric.note}</p>
            </article>
          )
        })}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <section className="min-w-0 overflow-hidden rounded-lg border border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
          <div className="flex items-center justify-between border-b border-[#e9ede7] px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-[#233a30]">Recent invoices</h2>
              <p className="mt-1 text-xs text-[#89948c]">Your latest billing activity.</p>
            </div>
            <Link href="/dashboard/invoices" className="text-sm font-semibold text-[#176c53] hover:text-[#125b46]">
              View all
            </Link>
          </div>

          {stats.recentInvoices.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <span className="flex size-11 items-center justify-center rounded-lg bg-[#eaf3ec] text-[#176c53]">
                <FileText className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-[#263d33]">No invoices yet</p>
              <p className="mt-1 text-sm text-[#89948c]">Create your first invoice to start tracking payments.</p>
              <Link href="/dashboard/invoices/new" className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[#176c53] px-3 text-sm font-semibold text-white hover:bg-[#125b46]">
                <Plus className="size-4" />
                Create invoice
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#edf0eb]">
              {stats.recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-4 transition-colors hover:bg-[#f8faf6] sm:grid-cols-[minmax(0,1.3fr)_minmax(110px,0.8fr)_minmax(110px,0.7fr)_auto] sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#718078]">{invoice.invoiceNumber}</p>
                    <p className="mt-1 truncate text-sm font-medium text-[#263d33]">{invoice.client.name}</p>
                  </div>
                  <p className="hidden truncate text-sm text-[#69776e] sm:block">
                    {invoice.lineItems[0]?.description ?? "No line items yet"}
                  </p>
                  <div className="text-right sm:text-left">
                    <p className="text-sm font-semibold text-[#263d33]">
                      {CURRENCY_SYMBOLS[invoice.currency] ?? `${invoice.currency} `}
                      {Number(invoice.total).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </p>
                    <p className="mt-1 text-xs text-[#89948c] sm:hidden">
                      Due {new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:justify-end sm:gap-3">
                    <p className="hidden whitespace-nowrap text-xs text-[#89948c] sm:block">
                      Due {new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[invoice.status] ?? STATUS_STYLES.DRAFT}`}>
                      {formatInvoiceStatus(invoice.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-lg border border-[#e1e7de] bg-[#fffefa] p-5 shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#233a30]">Invoice activity</h2>
                <p className="mt-1 text-xs text-[#89948c]">Invoices created, last six weeks</p>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#e8f4ec] text-[#176c53]">
                <Activity className="size-[18px]" />
              </span>
            </div>
            <div className="mt-5 flex h-32 items-end gap-2 border-b border-[#e8ece6] pb-2" role="img" aria-label="Invoice counts for the last six weeks">
              {stats.invoiceActivity.map((week, index) => {
                const height = week.count === 0 ? 4 : Math.max(12, (week.count / maxActivity) * 100)
                return (
                  <div key={week.label} className="flex h-full min-w-0 flex-1 flex-col items-center gap-2">
                    <div className={`mt-auto w-full rounded-t-sm ${index === stats.invoiceActivity.length - 1 ? "bg-[#176c53]" : "bg-[#c8dfd1]"}`} style={{ height: `${height}%` }} />
                    <span className="whitespace-nowrap text-[9px] text-[#89948c]">{week.label}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-[#89948c]">Total invoices</span>
              <span className="font-semibold text-[#263d33]">{stats.totalInvoices}</span>
            </div>
          </section>

          <section className="rounded-lg border border-[#eaded5] bg-[#fffaf6] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#46352e]">Follow-up queue</h2>
                <p className="mt-1 text-xs text-[#9a8175]">
                  {stats.outstandingInvoiceCount === 0
                    ? "No invoices are awaiting payment."
                    : `${stats.outstandingInvoiceCount} ${stats.outstandingInvoiceCount === 1 ? "invoice" : "invoices"} awaiting payment.`}
                </p>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#f8e9df] text-[#b45a45]">
                <Clock3 className="size-[18px]" />
              </span>
            </div>
            {stats.followUpInvoices.length === 0 ? (
              <p className="mt-5 border-t border-[#efe3dc] pt-4 text-sm text-[#8e7c72]">You&apos;re all caught up.</p>
            ) : (
              <div className="mt-4 divide-y divide-[#efe3dc]">
                {stats.followUpInvoices.map((invoice) => (
                  <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f1ded2] text-xs font-semibold text-[#80513f]">
                      {invoice.client.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#46352e]">{invoice.client.name}</span>
                      <span className="mt-0.5 block text-xs text-[#9a8175]">
                        {invoice.invoiceNumber} · {invoice.status === "OVERDUE" ? "Overdue" : `Due ${new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                      </span>
                    </span>
                    <span className="whitespace-nowrap text-sm font-semibold text-[#98513f]">
                      {CURRENCY_SYMBOLS[invoice.currency] ?? `${invoice.currency} `}
                      {Number(invoice.total).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Link href="/dashboard/invoices/new" className="flex items-center gap-3 rounded-lg border border-[#dce8df] bg-[#eaf3ec] p-4 transition-colors hover:bg-[#e1eee5] sm:px-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#d6eadc] text-[#176c53]">
          <Sparkles className="size-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[#244b3a]">Start an AI-assisted invoice</span>
          <span className="mt-0.5 block text-xs text-[#648171]">Turn a work note into clean, itemized billing.</span>
        </span>
        <span className="hidden text-sm font-semibold text-[#176c53] sm:inline">Create invoice <ArrowUpRight className="ml-1 inline size-4" /></span>
        <Plus className="size-5 shrink-0 text-[#176c53] sm:hidden" />
      </Link>
    </div>
  )
}