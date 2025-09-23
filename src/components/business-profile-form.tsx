
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { handleSaveBusinessProfile } from '@/app/actions';
import type { BusinessProfile, BusinessProfileCreation } from '@/lib/types';

interface BusinessProfileFormProps {
    profile: BusinessProfile | null;
    onProfileCreated: (profile: BusinessProfile) => void;
    onProfileUpdated: (profile: BusinessProfile) => void;
    onCancel: () => void;
}

const formSchema = z.object({
    profile_name: z.string().min(2, 'Profile name is required.'),
    store_url: z.string().url('Must be a valid URL (e.g., https://store.myshopify.com).'),
    contact_email: z.string().email('Must be a valid email address.'),
});

type FormValues = z.infer<typeof formSchema>;

export function BusinessProfileForm({ profile, onProfileCreated, onProfileUpdated, onCancel }: BusinessProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const isNewProfile = !profile;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            profile_name: profile?.profile_name || '',
            store_url: profile?.store_url || '',
            contact_email: profile?.contact_email || '',
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        
        const profileData: BusinessProfileCreation = {
            id: profile?.id, // Let Supabase handle the UUID generation if it's a new profile
            ...values,
        };

        const result = await handleSaveBusinessProfile(profileData);

        if (result.success && result.profile) {
            toast({
                title: `Profile ${isNewProfile ? 'Created' : 'Updated'}`,
                description: `The profile "${result.profile.profile_name}" has been saved.`,
            });
            if (isNewProfile) {
                onProfileCreated(result.profile);
            } else {
                onProfileUpdated(result.profile);
            }
        } else {
            toast({
                title: 'Save Failed',
                description: result.error,
                variant: 'destructive',
            });
        }

        setIsSubmitting(false);
    };

    return (
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>{isNewProfile ? 'Create New Business Profile' : 'Edit Business Profile'}</CardTitle>
                        <CardDescription>{isNewProfile ? 'Add a new business profile to manage its settings.' : `Editing "${profile?.profile_name}"`}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="profile_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profile Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., My Shopify Store" {...field} />
                                    </FormControl>
                                    <FormDescription>A unique name to identify this business profile.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="store_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Store URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://your-store.myshopify.com" {...field} />
                                    </FormControl>
                                    <FormDescription>The primary URL of the e-commerce store for this profile.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contact_email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="contact@mystore.com" {...field} />
                                    </FormControl>
                                    <FormDescription>The primary contact email for this business.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Profile
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
