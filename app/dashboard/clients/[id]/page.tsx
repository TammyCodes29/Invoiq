import { notFound } from "next/navigation"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getClientById } from "@/actions/clients"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Building2, MapPin, Plus } from "lucide-react"
import Link from "next/link"


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

  const totalInvoiced = client.invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total),
    0
  )

  const paidInvoices = client.invoices.filter(
    (invoice) => invoice.status === "PAID"
  )

  const totalPaid = paidInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total),
    0
  )

  const outstanding = totalInvoiced - totalPaid

  return (
    <div className="space-y-8">

      {/* Back button and header */}
      <div>
        <Link href="/dashboard/clients">
          <Button
            variant="ghost"
            className="mb-4 gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to Clients
          </Button>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          {client.name}
        </h1>

        {client.company && (
          <p className="mt-1 text-zinc-400">{client.company}</p>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Invoiced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              ₦{totalInvoiced.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">
              ₦{totalPaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">
              ₦{outstanding.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Contact info */}
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-white">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="flex items-center gap-3 text-sm">
              <Mail className="size-4 shrink-0 text-zinc-400" />
              <span className="text-zinc-300">{client.email}</span>
            </div>

            {client.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="size-4 shrink-0 text-zinc-400" />
                <span className="text-zinc-300">{client.phone}</span>
              </div>
            )}

            {client.company && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="size-4 shrink-0 text-zinc-400" />
                <span className="text-zinc-300">{client.company}</span>
              </div>
            )}

            {client.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="size-4 shrink-0 text-zinc-400" />
                <span className="text-zinc-300">{client.address}</span>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Invoices list */}
        <div className="lg:col-span-2">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Invoices</CardTitle>
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
                  <p className="text-zinc-400">No invoices yet</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Create the first invoice for this client
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {client.invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-zinc-400">
                          Due {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="font-medium text-white">
                          ₦{Number(invoice.total).toLocaleString()}
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
  const styles: Record<string, string> = {
    DRAFT: "bg-zinc-700 text-zinc-300",
    SENT: "bg-blue-500/20 text-blue-400",
    PAID: "bg-green-500/20 text-green-400",
    OVERDUE: "bg-red-500/20 text-red-400",
    CANCELLED: "bg-zinc-700 text-zinc-500",
  }

  return (
    <Badge className={styles[status] ?? styles.DRAFT}>
      {status}
    </Badge>
  )
}