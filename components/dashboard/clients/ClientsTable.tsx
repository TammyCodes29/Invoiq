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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-20 text-center">
        <p className="text-lg font-medium text-white">No clients yet</p>
        <p className="mt-1 text-sm text-zinc-400">
          Add your first client using the button above
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Name</TableHead>
              <TableHead className="text-zinc-400">Email</TableHead>
              <TableHead className="text-zinc-400">Company</TableHead>
              <TableHead className="text-zinc-400">Invoices</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                className="border-zinc-800 hover:bg-zinc-800/50"
              >
                <TableCell className="font-medium text-white">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="hover:text-blue-400 hover:underline transition-colors"
                  >
                    {client.name}
                  </Link>
                </TableCell>

                <TableCell className="text-zinc-400">
                  {client.email}
                </TableCell>

                <TableCell className="text-zinc-400">
                  {client.company ?? "—"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-zinc-800 text-zinc-300"
                  >
                    {client._count.invoices}{" "}
                    {client._count.invoices === 1 ? "invoice" : "invoices"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-white"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="border-zinc-700 bg-zinc-900"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
                        onClick={() => setEditingClient(client)}
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="cursor-pointer text-red-400 focus:bg-zinc-800 focus:text-red-400"
                        onClick={() => handleDelete(client.id)}
                        disabled={deletingId === client.id}
                      >
                        <Trash2 className="mr-2 size-4" />
                        {deletingId === client.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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