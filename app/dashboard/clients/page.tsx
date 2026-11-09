import { getClients } from "@/actions/clients"
import { AddClientDialog } from "@/components/dashboard/clients/AddClientDialog"
import { ClientsTable } from "@/components/dashboard/clients/ClientsTable"

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase text-[#738278]">Relationships</p>
          <h1 className="font-serif text-[34px] font-normal leading-tight text-[#1b3029]">
            Clients
          </h1>
          <p className="mt-2 text-sm text-[#718078]">
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <AddClientDialog />
        </div>
      </header>
      <ClientsTable clients={clients}/>
    </div>
  )
}