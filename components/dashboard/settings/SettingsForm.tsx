"use client"

import { useState } from "react"
import { useForm, useWatch   } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updateSettings } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, CheckCircle2, Landmark } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const settingsSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  defaultCurrency: z.enum(["NGN", "USD", "GBP"]),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
})

type SettingsData = z.infer<typeof settingsSchema>

type SettingsFormProps = {
  initialData: SettingsData
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const { register, handleSubmit, setValue, control } = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  })

  const currentCurrency = useWatch({ control, name: "defaultCurrency" })

  async function onSubmit(data: SettingsData) {
    setIsSubmitting(true)
    setSuccessMessage("")

    const result = await updateSettings(data)

    if (result.success) {
      setSuccessMessage("Settings saved successfully.")
      setTimeout(() => setSuccessMessage(""), 3000)
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Business Details */}
      <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#edf2fa] text-[#3863a0]">
              <Building2 className="size-[18px]" />
            </span>
            <div>
              <CardTitle className="text-base font-semibold text-[#233a30]">Business details</CardTitle>
              <p className="mt-1 text-xs text-[#89948c]">These details appear on invoices you send.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[#57675c]">Business name</Label>
            <Input {...register("businessName")} className="border-[#dfe5dc] bg-white text-[#263d33] placeholder:text-[#9aa49c]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#57675c]">Business phone</Label>
            <Input {...register("businessPhone")} className="border-[#dfe5dc] bg-white text-[#263d33] placeholder:text-[#9aa49c]" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-[#57675c]">Business address</Label>
            <Input {...register("businessAddress")} className="border-[#dfe5dc] bg-white text-[#263d33] placeholder:text-[#9aa49c]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#57675c]">Default currency</Label>
            <Select value={currentCurrency} onValueChange={(val) => setValue("defaultCurrency", val as "NGN" | "USD" | "GBP")}>
              <SelectTrigger className="border-[#dfe5dc] bg-white text-[#263d33]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#dfe5dc] bg-[#fffefa] text-[#263d33]">
                <SelectItem value="NGN" className="text-[#42584d] focus:bg-[#edf1ea]">NGN - Naira</SelectItem>
                <SelectItem value="USD" className="text-[#42584d] focus:bg-[#edf1ea]">USD - Dollar</SelectItem>
                <SelectItem value="GBP" className="text-[#42584d] focus:bg-[#edf1ea]">GBP - Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="border-[#e1e7de] bg-[#fffefa] shadow-[0_1px_2px_rgba(27,47,41,0.03)]">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#e8f4ec] text-[#176c53]">
              <Landmark className="size-[18px]" />
            </span>
            <div>
              <CardTitle className="text-base font-semibold text-[#233a30]">Bank details</CardTitle>
              <p className="mt-1 text-xs text-[#89948c]">Optional payment information for your invoices.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[#57675c]">Bank name</Label>
            <Input {...register("bankName")} className="border-[#dfe5dc] bg-white text-[#263d33] placeholder:text-[#9aa49c]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#57675c]">Account name</Label>
            <Input {...register("accountName")} className="border-[#dfe5dc] bg-white text-[#263d33] placeholder:text-[#9aa49c]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#57675c]">Account number</Label>
            <Input {...register("accountNumber")} className="border-[#dfe5dc] bg-white text-[#263d33] placeholder:text-[#9aa49c]" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 border-t border-[#e1e7de] pt-4 sm:flex-row sm:items-center sm:justify-between">
        {successMessage && (
          <p role="status" className="inline-flex items-center gap-2 text-sm font-medium text-[#176c53]">
            <CheckCircle2 className="size-4" />
            {successMessage}
          </p>
        )}
        <div className="flex justify-end ml-auto">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

    </form>
  )
}