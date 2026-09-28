"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createInvoice } from "@/actions/invoices"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01),
  unitPrice: z.number().min(0),
})

const formSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  invoiceNumber: z.string().min(1),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  currency: z.enum(["NGN", "USD", "GBP"]),
  notes: z.string().optional(),
  tax: z.number().min(0).max(100),
  lineItems: z.array(lineItemSchema).min(1),
})

type FormData = z.infer<typeof formSchema>

type Client = {
  id: string
  name: string
  company: string | null
}

type InvoiceBuilderProps = {
  clients: Client[]
  defaultInvoiceNumber: string
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
}

function getDefaultDates() {
  const today = new Date()
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  return {
    today: today.toISOString().split("T")[0],
    dueDate: thirtyDaysFromNow.toISOString().split("T")[0],
  }
}

const DEFAULT_DATES = getDefaultDates()

export function InvoiceBuilder({
  clients,
  defaultInvoiceNumber,
}: InvoiceBuilderProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)


  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
   defaultValues: {
  invoiceNumber: defaultInvoiceNumber,
  issueDate: DEFAULT_DATES.today,
  dueDate: DEFAULT_DATES.dueDate,
  currency: "NGN",
  tax: 0,
  lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
},
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  })

  const watchedLineItems = useWatch({ control, name: "lineItems" })
  const watchedTax = useWatch({ control, name: "tax" })
  const watchedCurrency = useWatch({ control, name: "currency" })

  const subtotal = watchedLineItems?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) ?? 0

  const taxAmount = (subtotal * (watchedTax || 0)) / 100
  const total = subtotal + taxAmount
  const currencySymbol = CURRENCY_SYMBOLS[watchedCurrency] ?? "₦"

  function formatAmount(amount: number) {
    return `${currencySymbol}${amount.toLocaleString()}`
  }

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)

    const result = await createInvoice(data)

    if (result.success && result.invoiceId) {
      router.push(`/dashboard/invoices/${result.invoiceId}`)
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Invoice Details */}
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-white">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Client */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Client *</Label>
            <Select
              onValueChange={(val) => setValue("clientId", val)}
            >
              <SelectTrigger className="border-zinc-700 bg-zinc-800 text-white">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                {clients.map((client) => (
                  <SelectItem
                    key={client.id}
                    value={client.id}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                  >
                    {client.name}
                    {client.company ? ` — ${client.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-xs text-red-400">{errors.clientId.message}</p>
            )}
          </div>

          {/* Invoice Number */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Invoice Number *</Label>
            <Input
              {...register("invoiceNumber")}
              className="border-zinc-700 bg-zinc-800 text-white"
            />
            {errors.invoiceNumber && (
              <p className="text-xs text-red-400">{errors.invoiceNumber.message}</p>
            )}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Currency *</Label>
            <Select
              defaultValue="NGN"
              onValueChange={(val) =>
                setValue("currency", val as "NGN" | "USD" | "GBP")
              }
            >
              <SelectTrigger className="border-zinc-700 bg-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                <SelectItem value="NGN" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                  NGN — Nigerian Naira (₦)
                </SelectItem>
                <SelectItem value="USD" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                  USD — US Dollar ($)
                </SelectItem>
                <SelectItem value="GBP" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                  GBP — British Pound (£)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Issue Date *</Label>
            <Input
              type="date"
              {...register("issueDate")}
              className="border-zinc-700 bg-zinc-800 text-white"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Due Date *</Label>
            <Input
              type="date"
              {...register("dueDate")}
              className="border-zinc-700 bg-zinc-800 text-white"
            />
          </div>

          {/* Tax */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Tax (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              {...register("tax", { valueAsNumber: true })}
              className="border-zinc-700 bg-zinc-800 text-white"
            />
          </div>

        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Line Items</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2 border-zinc-700 text-zinc-300 hover:text-white"
            onClick={() =>
              append({ description: "", quantity: 1, unitPrice: 0 })
            }
          >
            <Plus className="size-4" />
            Add Line Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">

          {/* Header row */}
          <div className="hidden grid-cols-12 gap-3 text-xs font-medium text-zinc-500 sm:grid">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {fields.map((field, index) => {
            const qty = watchedLineItems?.[index]?.quantity || 0
            const price = watchedLineItems?.[index]?.unitPrice || 0
            const lineTotal = qty * price

            return (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-3 items-center"
              >
                <div className="col-span-12 sm:col-span-6">
                  <Input
                    {...register(`lineItems.${index}.description`)}
                    placeholder="What did you do? e.g. Logo Design"
                    className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`lineItems.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    className="border-zinc-700 bg-zinc-800 text-white text-right"
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`lineItems.${index}.unitPrice`, {
                      valueAsNumber: true,
                    })}
                    className="border-zinc-700 bg-zinc-800 text-white text-right"
                  />
                </div>

                <div className="col-span-3 sm:col-span-2 text-right">
                  <span className="text-sm font-medium text-white">
                    {formatAmount(lineTotal)}
                  </span>
                </div>

                <div className="col-span-1 flex justify-end">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-zinc-500 hover:text-red-400"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}

          {errors.lineItems && (
            <p className="text-xs text-red-400">
              Add at least one line item with a description
            </p>
          )}

        </CardContent>
      </Card>

      {/* Notes and Totals */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Notes */}
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-white">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("notes")}
              placeholder="Payment instructions, bank details, thank you note..."
              className="min-h-32 border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
            />
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-white">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">

            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-white">{formatAmount(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">
                Tax ({watchedTax || 0}%)
              </span>
              <span className="text-white">{formatAmount(taxAmount)}</span>
            </div>

            <div className="border-t border-zinc-700 pt-3 flex justify-between">
              <span className="font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-white">
                {formatAmount(total)}
              </span>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          className="text-zinc-400 hover:text-white"
          onClick={() => router.back()}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? "Creating..." : "Create Invoice"}
        </Button>
      </div>

    </form>
  )
}