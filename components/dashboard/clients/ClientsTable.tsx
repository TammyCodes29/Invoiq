"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react"
import { deleteClient } from "@/actions/clients"
import { EditClientDialog } from "./EditClientDialog"
import Link from "next/link"

type Client = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  address: string | null
  createdAt: Date
  _count: { invoices: number }
}

type ClientsTableProps = {
  clients: Client[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  async function handleDelete(clientId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?"
    )

    if (!confirmed) return

    setDeletingId(clientId)
    await deleteClient(clientId)
    setDeletingId(null)
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d7e1d7] bg-[#fffefa] py-16 text-center">
        <span className="flex size-11 items-center justify-center rounded-lg bg-[#edf2fa] text-[#3863a0]">
          <Users className="size-5" />
        </span>
        <p className="mt-3 text-sm font-semibold text-[#263d33]">No clients yet</p>
        <p className="mt-1 text-sm text-[#89948c]">
          Add your first client using the button above
        </p>
      </div>
    )
  }

  function renderActions(client: Client) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${client.name}`}
            className="shrink-0 text-[#738278] hover:bg-[#edf1ea] hover:text-[#1b483d]"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="border-[#dfe5dc] bg-[#fffefa] text-[#33483d]">
          <DropdownMenuItem
            className="cursor-pointer text-[#42584d] focus:bg-[#edf1ea] focus:text-[#1b483d]"
            onClick={() => setEditingClient(client)}
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer text-[#a64f3b] focus:bg-[#fbefea] focus:text-[#a64f3b]"
            onClick={() => handleDelete(client.id)}
            disabled={deletingId === client.id}
          >
            <Trash2 className="mr-2 size-4" />
            {deletingId === client.id ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
        <ul className="divide-y divide-[#edf0eb] lg:hidden">
          {clients.map((client) => (
            <li key={client.id} className="flex items-start gap-3 p-4 transition-colors hover:bg-[#f8faf6]">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex min-w-0 items-center gap-2">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="truncate text-sm font-semibold text-[#263d33] transition-colors hover:text-[#176c53]"
                  >
                    {client.name}
                  </Link>
                  <Badge variant="secondary" className="shrink-0 border-0 bg-[#f0f1ed] text-[10px] text-[#6e7971]">
                    {client._count.invoices} {client._count.invoices === 1 ? "invoice" : "invoices"}
                  </Badge>
                </div>
                <p className="break-all text-sm text-[#718078]">{client.email}</p>
                {client.company && (
                  <p className="truncate text-xs text-[#89948c]">{client.company}</p>
                )}
              </div>
              {renderActions(client)}
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
        <Table>
          <TableHeader className="bg-[#f8f9f5]">
            <TableRow className="border-[#e9ede7] hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase text-[#758279]">Name</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase text-[#758279]">Email</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase text-[#758279]">Company</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase text-[#758279]">Invoices</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                className="border-[#edf0eb] hover:bg-[#f8faf6]"
              >
                <TableCell className="font-medium text-[#263d33]">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="transition-colors hover:text-[#176c53] hover:underline"
                  >
                    {client.name}
                  </Link>
                </TableCell>

                <TableCell className="break-all text-[#718078]">
                  {client.email}
                </TableCell>

                <TableCell className="text-[#718078]">
                  {client.company ?? "—"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className="border-0 bg-[#f0f1ed] text-[#6e7971]"
                  >
                    {client._count.invoices}{" "}
                    {client._count.invoices === 1 ? "invoice" : "invoices"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  {renderActions(client)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {editingClient && (
        <EditClientDialog
          client={editingClient}
          open={!!editingClient}
          onClose={() => setEditingClient(null)}
        />
      )}
    </>
  )
}