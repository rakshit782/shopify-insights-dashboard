'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Key, ShoppingCart, Percent, Boxes, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleGetOrCreateUser, handleGetCredentialStatuses } from '@/app/actions';
import type { User, Profile } from '@/lib/types';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';

const InfoRow = ({ icon: Icon, label, value, isLoading }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  isLoading: boolean;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium">{label}</p>
      {isLoading ? (
        <Skeleton className="h-5 w-48 mt-1" />
      ) : (
        <p className={cn('text-sm text-muted-foreground font-mono break-all')}>
          {value || 'N/A'}
        </p>
      )}
    </div>
  </div>
);

function UserProfileCard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);
      const result = await handleGetOrCreateUser();
      if (result.success) {
        setUser(result.user);
        setProfile(result.profile);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }
    fetchUser();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Credentials</CardTitle>
        <CardDescription>Your current user session information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <InfoRow
          icon={Mail}
          label="Email"
          value={profile?.email}
          isLoading={isLoading}
        />
        <InfoRow
          icon={Key}
          label="Authentication"
          value={user?.auth0_id}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}

const marketplaceSyncSchema = z.object({
  id: z.string(),
  name: z.string(),
  syncInventory: z.boolean(),
  syncPrice: z.boolean(),
  priceAdjustment: z.coerce.number(),
});

const syncSettingsSchema = z.object({
  marketplaces: z.array(marketplaceSyncSchema),
});

type SyncSettingsFormValues = z.infer<typeof syncSettingsSchema>;

const platformIconMap: { [key: string]: string } = {
    shopify: '/shopify.svg',
    amazon: '/amazon.svg',
    walmart: '/walmart.svg',
    ebay: '/ebay.svg',
    etsy: '/etsy.svg',
};

function MarketplaceSyncSettings() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SyncSettingsFormValues>({
        resolver: zodResolver(syncSettingsSchema),
        defaultValues: {
            marketplaces: [],
        },
    });

    const { fields, replace } = useFieldArray({
        control: form.control,
        name: 'marketplaces',
    });

    useEffect(() => {
        async function loadSettings() {
            setIsLoading(true);
            const statusResult = await handleGetCredentialStatuses();
            if (statusResult.success) {
                const connectedChannels = Object.keys(statusResult.statuses)
                    .filter(key => statusResult.statuses[key] && platformIconMap[key] && key !== 'shopify') // Exclude shopify as source
                    .map(key => ({
                        id: key,
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        // In a real app, these values would come from the database
                        syncInventory: false, 
                        syncPrice: false,
                        priceAdjustment: 0,
                    }));
                replace(connectedChannels);
            }
            setIsLoading(false);
        }
        loadSettings();
    }, [replace]);

    const onSubmit = (data: SyncSettingsFormValues) => {
        setIsSubmitting(true);
        console.log('Submitting sync settings:', data);
        // In a real app, you would call a server action here to save the settings.
        // await handleSaveSyncSettings(data);
        toast({
            title: 'Settings Saved',
            description: 'Your marketplace sync settings have been updated.',
        });
        setIsSubmitting(false);
    };

    return (
         <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Marketplace Sync Settings</CardTitle>
                        <CardDescription>
                            Configure how inventory and pricing are synced from Shopify to other marketplaces.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : fields.length > 0 ? (
                            fields.map((field, index) => (
                                <div key={field.id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Image src={platformIconMap[field.id]} alt={field.name} width={24} height={24} />
                                            <h3 className="text-lg font-semibold">{field.name}</h3>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 p-4 border rounded-lg">
                                        <FormField
                                            control={form.control}
                                            name={`marketplaces.${index}.syncInventory`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-1">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="flex items-center gap-2"><Boxes className="h-4 w-4"/> Sync Inventory</FormLabel>
                                                    </div>
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`marketplaces.${index}.syncPrice`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-1">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="flex items-center gap-2"><ShoppingCart className="h-4 w-4"/> Sync Price</FormLabel>
                                                    </div>
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`marketplaces.${index}.priceAdjustment`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-1">
                                                    <FormLabel className="text-xs">Price Adjustment (%)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input type="number" {...field} className="pl-8" />
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {index < fields.length - 1 && <Separator className="mt-6" />}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No other marketplaces are connected. Add credentials in your .env file to configure sync settings.</p>
                        )}
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isSubmitting || isLoading || fields.length === 0}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Sync Settings
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}

export function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your application settings and synchronization rules.</p>
      </div>
      <UserProfileCard />
      <MarketplaceSyncSettings />
    </div>
  );
}