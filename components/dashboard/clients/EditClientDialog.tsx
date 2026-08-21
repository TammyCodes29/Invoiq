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
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
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
                  <FormLabel className="text-zinc-300">Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      className="border-zinc-700 bg-zinc-800 text-white"
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
                  <FormLabel className="text-zinc-300">Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="border-zinc-700 bg-zinc-800 text-white"
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
                  <FormLabel className="text-zinc-300">Phone</FormLabel>
                  <FormControl>
                    <Input
                      className="border-zinc-700 bg-zinc-800 text-white"
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
                  <FormLabel className="text-zinc-300">Company</FormLabel>
                  <FormControl>
                    <Input
                      className="border-zinc-700 bg-zinc-800 text-white"
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
                  <FormLabel className="text-zinc-300">Address</FormLabel>
                  <FormControl>
                    <Input
                      className="border-zinc-700 bg-zinc-800 text-white"
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
                className="text-zinc-400 hover:text-white"
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

