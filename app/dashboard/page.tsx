import { getDashboardStats } from "@/actions/invoices"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-700 text-zinc-300",
  SENT: "bg-blue-500/20 text-blue-400",
  PAID: "bg-green-500/20 text-green-400",
  OVERDUE: "bg-red-500/20 text-red-400",
  CANCELLED: "bg-zinc-700 text-zinc-500",
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
}

// Helper to format the grouped currency map
function formatCurrencyMap(map: Record<string, number>) {
  const entries = Object.entries(map)
  if (entries.length === 0) return "₦0"
  
  return entries
    .map(([currency, amount]) => {
      const symbol = CURRENCY_SYMBOLS[currency] ?? currency
      return `${symbol}${amount.toLocaleString()}`
    })
    .join(" + ")
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const metrics = [
    {
      title: "Total Clients",
      value: stats.totalClients.toString(),
      description:
        stats.totalClients === 0
          ? "Add your first client to get started"
          : `${stats.totalClients} ${stats.totalClients === 1 ? "client" : "clients"} on your roster`,
      icon: Users,
      href: "/dashboard/clients",
      highlight: false,
    },
    {
      title: "Total Revenue",
      value: formatCurrencyMap(stats.revenueMap),
      description:
        Object.keys(stats.revenueMap).length === 0
          ? "No payments received yet"
          : "From all paid invoices",
      icon: TrendingUp,
      href: "/dashboard/invoices",
      highlight: false,
    },
    {
      title: "Outstanding",
      value: formatCurrencyMap(stats.outstandingMap),
      description:
        Object.keys(stats.outstandingMap).length === 0
          ? "No pending payments"
          : "Across sent and overdue invoices",
      icon: AlertCircle,
      href: "/dashboard/invoices",
      highlight: Object.keys(stats.outstandingMap).length > 0,
    },

  ]

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Here is what is happening with your business today.
        </p>
      </div>

      {/* Metric cards */}
      <section aria-label="Business metrics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon

            return (
              <Link key={metric.title} href={metric.href}>
                <Card className="border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">
                      {metric.title}
                    </CardTitle>
                    <Icon
                      className={`size-4 ${
                        metric.highlight ? "text-red-400" : "text-zinc-500"
                      }`}
                    />
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`text-3xl font-bold ${
                        metric.highlight ? "text-red-400" : "text-white"
                      }`}
                    >
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {metric.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recent invoices */}
      <section aria-label="Recent invoices">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Recent Invoices
          </h2>
          <Link href="/dashboard/invoices">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
            >
              View all
            </Button>
          </Link>
        </div>

        {stats.recentInvoices.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 size-8 text-zinc-600" />
              <p className="font-medium text-white">No invoices yet</p>
              <p className="mt-1 text-sm text-zinc-400">
                Create your first invoice to start tracking revenue
              </p>
              <Link href="/dashboard/invoices/new" className="mt-4">
                <Button size="sm">Create Invoice</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-zinc-800 bg-zinc-900/60">
            <div className="divide-y divide-zinc-800">
              {stats.recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-800/50"
                >
                  <div>
                    <p className="font-medium text-white">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {invoice.client.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-medium text-white">
                      {CURRENCY_SYMBOLS[invoice.currency] ?? "₦"}
                      {Number(invoice.total).toLocaleString()}
                    </p>
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
          </Card>
        )}
      </section>

    </div>
  )
}