"use client"

import { useState } from "react"
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { updateInvoiceStatus } from "@/actions/invoices"

type PayInvoiceButtonProps = {
  invoiceId: string
  amount: number
  currency: string
  clientEmail: string
  clientName: string
  clientPhone: string | null
  invoiceNumber: string
  currentStatus: string
}

export function PayInvoiceButton({
  invoiceId,
  amount,
  currency,
  clientEmail,
  clientName,
  clientPhone,
  invoiceNumber,
  currentStatus,
}: PayInvoiceButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  // FIX 1: Define config and call the hook BEFORE any early returns
   const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "",
    tx_ref: `INV-${invoiceId}`, 
    amount: amount,
    currency: currency,
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: clientEmail,
      name: clientName,
      phone_number: clientPhone || "08000000000", 
    },
    customizations: {
      title: `Invoice ${invoiceNumber}`,
      description: `Payment for invoice ${invoiceNumber}`,
      logo: "https://via.placeholder.com/150", // <-- Add this line!
    },
  }

  const handleFlutterPayment = useFlutterwave(config)

  // FIX 1 continued: Now we can do the early return
  if (currentStatus === "PAID" || currentStatus === "CANCELLED") {
    return null
  }

  async function handlePayment() {
    setIsProcessing(true)

    handleFlutterPayment({
      callback: async (response) => {
        if (response.status === "successful") {
          await updateInvoiceStatus(invoiceId, "PAID")
          alert("Payment successful! Invoice marked as PAID.")
          window.location.reload()
        }
        closePaymentModal()
      },
      onClose: () => {
        setIsProcessing(false)
      },
    })
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className="gap-2 bg-green-600 hover:bg-green-700 text-white"
    >
      <CreditCard className="size-4" />
      {isProcessing ? "Processing..." : "Pay Now"}
    </Button>
  )
}