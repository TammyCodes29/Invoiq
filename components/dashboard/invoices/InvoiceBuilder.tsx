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
import { Plus, Trash2, Sparkles} from "lucide-react"
import { generateLineItems } from "@/actions/ai"

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
  defaultClientId?: string
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
  defaultClientId,
}: InvoiceBuilderProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)


  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
   defaultValues: {
  clientId: defaultClientId ?? "",
  invoiceNumber: defaultInvoiceNumber,
  issueDate: DEFAULT_DATES.today,
  dueDate: DEFAULT_DATES.dueDate,
  currency: "NGN",
  tax: 0,
  lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
},
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "lineItems",
  })

  const watchedLineItems = useWatch({ control, name: "lineItems" })
  const watchedTax = useWatch({ control, name: "tax" })
  const watchedCurrency = useWatch({ control, name: "currency" })

  const safeLineItems = Array.isArray(watchedLineItems) ? watchedLineItems : []

  const subtotal = safeLineItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  )
  const taxAmount = (subtotal * (watchedTax || 0)) / 100
  const total = subtotal + taxAmount
  const currencySymbol = CURRENCY_SYMBOLS[watchedCurrency] ?? "₦"

  function formatAmount(amount: number) {
    return `${currencySymbol}${amount.toLocaleString()}`
  }

  async function handleAIGenerate() {
  if (!aiPrompt.trim()) return
  
  setIsGenerating(true)
  const result = await generateLineItems(aiPrompt, 50000) // 50000 is a dummy default rate
  
  // Check if we got a valid array back
    if (result.success && Array.isArray(result.lineItems) && result.lineItems.length > 0) {
      
      // THIS IS THE MAGIC FIX:
      // replace() updates BOTH the form data AND the UI fields array
      replace(result.lineItems) 
      
      setAiPrompt("") // Clear the prompt
    } else {
      alert("AI could not generate valid line items. Please try a different description.")
    }
    
    setIsGenerating(false)
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
      <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#233a30]">Invoice details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Client */}
          <div className="space-y-2">
            <Label className="text-[#57675c]">Client *</Label>
            <Select
              defaultValue={defaultClientId}
              onValueChange={(val) =>
                setValue("clientId", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="border-[#dfe5dc] bg-white text-[#263d33]">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent className="border-[#dfe5dc] bg-[#fffefa] text-[#263d33]">
                {clients.map((client) => (
                  <SelectItem
                    key={client.id}
                    value={client.id}
                    className="text-[#42584d] focus:bg-[#edf1ea] focus:text-[#1b483d]"
                  >
                    {client.name}
                    {client.company ? ` — ${client.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-xs text-[#aa503d]">{errors.clientId.message}</p>
            )}
          </div>

          {/* Invoice Number */}
          <div className="space-y-2">
            <Label className="text-[#57675c]">Invoice number *</Label>
            <Input
              {...register("invoiceNumber")}
              className="border-[#dfe5dc] bg-white text-[#263d33]"
            />
            {errors.invoiceNumber && (
              <p className="text-xs text-[#aa503d]">{errors.invoiceNumber.message}</p>
            )}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label className="text-[#57675c]">Currency *</Label>
            <Select
              defaultValue="NGN"
              onValueChange={(val) =>
                setValue("currency", val as "NGN" | "USD" | "GBP")
              }
            >
              <SelectTrigger className="border-[#dfe5dc] bg-white text-[#263d33]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#dfe5dc] bg-[#fffefa] text-[#263d33]">
                <SelectItem value="NGN" className="text-[#42584d] focus:bg-[#edf1ea] focus:text-[#1b483d]">
                  NGN — Nigerian Naira (₦)
                </SelectItem>
                <SelectItem value="USD" className="text-[#42584d] focus:bg-[#edf1ea] focus:text-[#1b483d]">
                  USD — US Dollar ($)
                </SelectItem>
                <SelectItem value="GBP" className="text-[#42584d] focus:bg-[#edf1ea] focus:text-[#1b483d]">
                  GBP — British Pound (£)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label className="text-[#57675c]">Issue date *</Label>
            <Input
              type="date"
              {...register("issueDate")}
              className="border-[#dfe5dc] bg-white text-[#263d33]"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-[#57675c]">Due date *</Label>
            <Input
              type="date"
              {...register("dueDate")}
              className="border-[#dfe5dc] bg-white text-[#263d33]"
            />
          </div>

          {/* Tax */}
          <div className="space-y-2">
            <Label className="text-[#57675c]">Tax (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              {...register("tax", { valueAsNumber: true })}
              className="border-[#dfe5dc] bg-white text-[#263d33]"
            />
          </div>

        </CardContent>
      </Card>

      {/* Line Items */}
            {/* AI Assistant Panel */}
      <Card className="border-[#dce8df] bg-[#eaf3ec] shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#244b3a]">
            <Sparkles className="size-[18px] text-[#176c53]" />
            AI line item drafter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#648171]">
            Describe the work you did in plain English. The AI will break it down into professional line items.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Built a landing page for Acme Corp, took about 10 hours, and also set up their email hosting."
              className="min-h-20 min-w-0 flex-1 rounded-lg border border-[#d6e2d8] bg-white p-3 text-sm text-[#263d33] placeholder:text-[#9aa49c] focus:outline-none focus:ring-2 focus:ring-[#78a98e]"
            />
            <Button
              type="button"
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="self-end whitespace-nowrap bg-[#176c53] text-white hover:bg-[#125b46] sm:self-auto"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#233a30]">Line items</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2 border-[#d6dfd6] bg-white text-[#42584d] hover:bg-[#edf1ea] hover:text-[#1b483d]"
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
          <div className="hidden grid-cols-12 gap-3 text-[10px] font-semibold uppercase text-[#758279] sm:grid">
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
                className="grid grid-cols-2 items-end gap-3 sm:grid-cols-12 sm:items-center"
              >
                <div className="col-span-2 sm:col-span-6">
                  <Input
                    {...register(`lineItems.${index}.description`)}
                    placeholder="What did you do? e.g. Logo Design"
                    className="border-[#dfe5dc] bg-white text-[#263d33] placeholder:text-[#9aa49c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <span className="mb-1 block text-xs text-[#89948c] sm:hidden">
                    Quantity
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`lineItems.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    className="border-[#dfe5dc] bg-white text-right text-[#263d33]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <span className="mb-1 block text-xs text-[#89948c] sm:hidden">
                    Unit Price
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`lineItems.${index}.unitPrice`, {
                      valueAsNumber: true,
                    })}
                    className="border-[#dfe5dc] bg-white text-right text-[#263d33]"
                  />
                </div>

                <div className="flex min-h-10 items-center justify-between sm:col-span-1 sm:justify-end">
                  <span className="text-xs text-[#89948c] sm:hidden">Total</span>
                  <span className="text-sm font-medium text-[#263d33]">
                    {formatAmount(lineTotal)}
                  </span>
                </div>

                <div className="col-span-1 flex justify-end sm:col-span-1">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-[#89948c] hover:bg-[#fbefea] hover:text-[#aa503d]"
                      aria-label={`Remove line item ${index + 1}`}
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
            <p className="text-xs text-[#aa503d]">
              Add at least one line item with a description
            </p>
          )}

        </CardContent>
      </Card>

      {/* Notes and Totals */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Notes */}
        <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#233a30]">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("notes")}
              placeholder="Payment instructions, bank details, thank you note..."
              className="min-h-32 border-[#dfe5dc] bg-white text-[#263d33] placeholder:text-[#9aa49c]"
            />
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#233a30]">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">

            <div className="flex justify-between text-sm">
              <span className="text-[#718078]">Subtotal</span>
              <span className="text-[#42584d]">{formatAmount(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[#718078]">
                Tax ({watchedTax || 0}%)
              </span>
              <span className="text-[#42584d]">{formatAmount(taxAmount)}</span>
            </div>

            <div className="flex justify-between border-t border-[#e1e7de] pt-3">
              <span className="font-semibold text-[#263d33]">Total</span>
              <span className="text-xl font-bold text-[#20372e]">
                {formatAmount(total)}
              </span>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* Submit */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          className="text-[#718078] hover:bg-[#edf1ea] hover:text-[#1b483d]"
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