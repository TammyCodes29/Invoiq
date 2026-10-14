"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateInvoiceStatus, deleteInvoice } from "@/actions/invoices"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Trash2 } from "lucide-react"
import { sendInvoiceReminder } from "@/actions/email"
import { Mail } from "lucide-react" // Add this to your lucide imports

type InvoiceActionsProps = {
  invoiceId: string
  currentStatus: string
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["PAID", "OVERDUE", "CANCELLED"],
  OVERDUE: ["PAID", "CANCELLED"],
  PAID: [],
  CANCELLED: [],
}

export function InvoiceActions({
  invoiceId,
  currentStatus,
}: InvoiceActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] ?? []

  async function handleStatusChange(
    status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
  ) {
    setIsLoading(true)
    await updateInvoiceStatus(invoiceId, status)
    setIsLoading(false)
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?"
    )
    if (!confirmed) return

    setIsLoading(true)
    const result = await deleteInvoice(invoiceId)

    if (result.success) {
      router.push("/dashboard/invoices")
    }

    setIsLoading(false)
  }

    async function handleSendReminder() {
    const confirmed = window.confirm(
      "Send a payment reminder to this client?"
    )
    if (!confirmed) return

    setIsLoading(true)
    const result = await sendInvoiceReminder(invoiceId)

    if (result.success) {
      alert("Reminder sent successfully!")
    } else {
      alert("Failed to send reminder.")
    }

    setIsLoading(false)
  }
  return (
    <div className="flex items-center gap-2">
      {availableTransitions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-zinc-700 text-zinc-300 hover:text-white"
              disabled={isLoading}
            >
              Update Status
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="border-zinc-700 bg-zinc-900"
          >
            {availableTransitions.map((status) => (
              <DropdownMenuItem
                key={status}
                className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
                onClick={() =>
                  handleStatusChange(
                    status as "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
                  )
                }
              >
                Mark as {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

       <Button
        variant="outline"
        size="icon"
        className="text-zinc-400 hover:text-blue-400 border-zinc-700"
        disabled={isLoading}
        onClick={handleSendReminder}
        title="Send Payment Reminder"
      >
        <Mail className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-zinc-500 hover:text-red-400"
        disabled={isLoading}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}