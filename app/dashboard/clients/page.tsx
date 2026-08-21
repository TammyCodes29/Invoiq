import { getClients } from "@/actions/clients"
import { AddClientDialog } from "@/components/dashboard/clients/AddClientDialog"
import { ClientsTable } from "@/components/dashboard/clients/ClientsTable"

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Clients
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </p>
        </div>
        <AddClientDialog />
      </header>
      <ClientsTable clients={clients}/>
    </div>
  )
}