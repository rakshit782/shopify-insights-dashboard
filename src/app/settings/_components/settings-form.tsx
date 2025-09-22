
'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { saveSupabaseCredentials } from "../actions"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react";
import { Loader2, Edit, Check } from "lucide-react";

const formSchema = z.object({
  supabaseUrl: z.string().url({ message: "Please enter a valid URL." }),
  supabaseKey: z.string().min(1, { message: "Supabase key cannot be empty." }),
})

interface SettingsFormProps {
    defaultValues: {
        supabaseUrl: string | undefined;
        supabaseKey: string | undefined;
    }
}

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(!defaultValues.supabaseUrl || !defaultValues.supabaseKey);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supabaseUrl: defaultValues.supabaseUrl ?? '',
      supabaseKey: defaultValues.supabaseKey ?? '',
    },
  })
 
  useEffect(() => {
    // If credentials are provided, disable editing by default
    if (defaultValues.supabaseUrl && defaultValues.supabaseKey) {
      setIsEditing(false);
    }
  }, [defaultValues]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData()
    formData.append('supabaseUrl', values.supabaseUrl)
    formData.append('supabaseKey', values.supabaseKey)

    const result = await saveSupabaseCredentials(formData)

    if (result.success) {
      toast({
        title: "Credentials Saved",
        description: "Your Supabase credentials have been saved successfully.",
      })
      setIsEditing(false); // Go back to read-only mode
      router.push('/')
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="supabaseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supabase Project URL</FormLabel>
              <FormControl>
                <Input placeholder="https://<project-id>.supabase.co" {...field} disabled={!isEditing} />
              </FormControl>
              <FormDescription>
                This is your Supabase project URL.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supabaseKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supabase Anon Key</FormLabel>
              <FormControl>
                <Input type="password" placeholder="your-anon-key" {...field} disabled={!isEditing} />
              </FormControl>
              <FormDescription>
                This is your public-facing Supabase anon key.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing ? (
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Check className="mr-2 h-4 w-4" />
                Save Credentials
            </Button>
        ) : (
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Credentials
            </Button>
        )}
      </form>
    </Form>
  )
}
