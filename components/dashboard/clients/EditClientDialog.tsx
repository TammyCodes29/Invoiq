"use client"

import { updateClient } from "@/actions/clients"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ClientFormData, clientSchema } from "@/lib/validations/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

type Client ={
    id: string
    name: string
    email: string
    phone: string | null
    company: string | null
    address: string | null
}
type EditClientDialogProps = {
    client: Client  
    open: boolean
    onClose: () => void
}
export function EditClientDialog({ client, open, onClose }: EditClientDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form=useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        defaultValues:{
            name: client.name,
            email: client.email,
            phone: client.phone ?? "",
            company: client.company ?? "",
            address: client.address ?? "",
        },
    })

    useEffect(() => {
        form.reset({
            name: client.name,
            email: client.email,
            phone: client.phone ?? "",
            company: client.company ?? "",
            address: client.address ?? "",
        })  
    },  [client, form])

    async function onSubmit(data: ClientFormData) {
        setIsSubmitting(true)
    
        const result = await updateClient(client.id, data)

        if (result.success) {
            onClose()
        }

        setIsSubmitting(false)
    }


 return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="top-auto bottom-2 max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] translate-y-0 overflow-y-auto rounded-xl border-[#dfe5dc] bg-[#fffefa] p-5 text-[#263d33] shadow-xl data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-top-0 sm:bottom-auto sm:top-[50%] sm:w-full sm:max-w-md sm:translate-y-[-50%] sm:p-6 sm:data-[state=open]:slide-in-from-top-[48%] sm:data-[state=closed]:slide-out-to-top-[48%]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#57675c]">Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      className="border-[#dfe5dc] bg-white text-[#263d33]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#57675c]">Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="border-[#dfe5dc] bg-white text-[#263d33]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#57675c]">Phone</FormLabel>
                  <FormControl>
                    <Input
                      className="border-[#dfe5dc] bg-white text-[#263d33]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#57675c]">Company</FormLabel>
                  <FormControl>
                    <Input
                      className="border-[#dfe5dc] bg-white text-[#263d33]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#57675c]">Address</FormLabel>
                  <FormControl>
                    <Input
                      className="border-[#dfe5dc] bg-white text-[#263d33]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-[#718078] hover:bg-[#edf1ea] hover:text-[#1b483d]"
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

