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
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-white">Business Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Business Name</Label>
            <Input {...register("businessName")} className="border-zinc-700 bg-zinc-800 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Business Phone</Label>
            <Input {...register("businessPhone")} className="border-zinc-700 bg-zinc-800 text-white" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-zinc-300">Business Address</Label>
            <Input {...register("businessAddress")} className="border-zinc-700 bg-zinc-800 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Default Currency</Label>
            <Select value={currentCurrency} onValueChange={(val) => setValue("defaultCurrency", val as "NGN" | "USD" | "GBP")}>
              <SelectTrigger className="border-zinc-700 bg-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                <SelectItem value="NGN" className="text-zinc-300 focus:bg-zinc-800">NGN - Naira</SelectItem>
                <SelectItem value="USD" className="text-zinc-300 focus:bg-zinc-800">USD - Dollar</SelectItem>
                <SelectItem value="GBP" className="text-zinc-300 focus:bg-zinc-800">GBP - Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-white">Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Bank Name</Label>
            <Input {...register("bankName")} className="border-zinc-700 bg-zinc-800 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Account Name</Label>
            <Input {...register("accountName")} className="border-zinc-700 bg-zinc-800 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Account Number</Label>
            <Input {...register("accountNumber")} className="border-zinc-700 bg-zinc-800 text-white" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        {successMessage && (
          <p className="text-sm font-medium text-green-400">{successMessage}</p>
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