

'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Key, ShoppingCart, Percent, Boxes, Loader2, CheckCircle, XCircle, Hash, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleGetOrCreateUser, handleGetCredentialStatuses, handleSaveSettings, handleGetSettings } from '@/app/actions';
import type { User, Profile, AppSettings, MarketplaceSyncSetting } from '@/lib/types';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';

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

const platformIconMap: { [key: string]: string } = {
    shopify: '/shopify.svg',
    amazon: '/amazon.svg',
    walmart: '/walmart.svg',
    ebay: '/ebay.svg',
    etsy: '/etsy.svg',
    wayfair: '/wayfair.svg',
};

const platformNameMap: { [key: string]: string } = {
    shopify: 'Shopify',
    amazon: 'Amazon',
    walmart: 'Walmart',
    ebay: 'eBay',
    etsy: 'Etsy',
    wayfair: 'Wayfair',
}


function MarketplaceConnectionsCard() {
    const [statuses, setStatuses] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStatuses() {
            setIsLoading(true);
            const result = await handleGetCredentialStatuses();
            if (result.success) {
                setStatuses(result.statuses);
            }
            setIsLoading(false);
        }
        fetchStatuses();
    }, []);

    const allPlatforms = ['shopify', 'amazon', 'walmart', 'ebay', 'etsy', 'wayfair'];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Marketplace Connections</CardTitle>
                <CardDescription>
                    Status of your connected sales channels based on credentials in the .env file.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoading ? (
                         Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                <Skeleton className="h-6 w-24" />
                            </div>
                        ))
                    ) : (
                        allPlatforms.map(platform => (
                            <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Image src={platformIconMap[platform] || 'https://placehold.co/400'} alt={platform} width={20} height={20} unoptimized />
                                    <span className="font-medium">{platformNameMap[platform]}</span>
                                </div>
                                {statuses[platform] ? (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Connected
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Not Connected
                                    </Badge>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}


const marketplaceSyncSchema = z.object({
  id: z.string(),
  name: z.string(),
  syncInventory: z.boolean(),
  syncPrice: z.boolean(),
  priceAdjustment: z.coerce.number(),
  autoUpdateInventory: z.boolean(),
  defaultInventory: z.coerce.number().int(),
});

const settingsSchema = z.object({
  marketplaces: z.array(marketplaceSyncSchema),
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function GeneralSettings() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            marketplaces: [],
            logoUrl: '',
            faviconUrl: '',
        },
    });

    const { fields, replace } = useFieldArray({
        control: form.control,
        name: 'marketplaces',
    });

    useEffect(() => {
        async function loadSettings() {
            setIsLoading(true);
            const [statusResult, settingsResult] = await Promise.all([
                handleGetCredentialStatuses(),
                handleGetSettings()
            ]);

            let initialMarketplaceSettings: MarketplaceSyncSetting[] = [];

            if (statusResult.success && statusResult.statuses) {
                const connectedChannels = Object.keys(statusResult.statuses)
                    .filter(key => statusResult.statuses[key] && platformIconMap[key]);
                
                initialMarketplaceSettings = connectedChannels.map(key => {
                    const savedSetting = settingsResult.settings?.marketplaces.find(s => s.id === key);
                    if (savedSetting) {
                        return savedSetting;
                    }
                    // Return default values for newly connected marketplaces
                    return {
                        id: key,
                        name: platformNameMap[key] || (key.charAt(0).toUpperCase() + key.slice(1)),
                        syncInventory: key !== 'shopify',
                        syncPrice: key !== 'shopify',
                        priceAdjustment: 0,
                        autoUpdateInventory: false,
                        defaultInventory: 10,
                    };
                });
            }
            
            initialMarketplaceSettings.sort((a, b) => {
                if (a.id === 'shopify') return -1;
                if (b.id === 'shopify') return 1;
                return a.name.localeCompare(b.name);
            });

            replace(initialMarketplaceSettings);
            
            if (settingsResult.success && settingsResult.settings) {
                form.setValue('logoUrl', settingsResult.settings.logoUrl);
                form.setValue('faviconUrl', settingsResult.settings.faviconUrl);
            }

            setIsLoading(false);
        }
        loadSettings();
    }, [replace, form]);

    const onSubmit = async (data: SettingsFormValues) => {
        setIsSubmitting(true);
        const result = await handleSaveSettings(data);
        if (result.success) {
            toast({
                title: 'Settings Saved',
                description: 'Your application settings have been updated.',
            });
            // Force a hard reload to apply branding changes
            router.refresh();
            window.location.reload();
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
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>
                           Configure how data syncs across marketplaces.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Marketplace Sync Section */}
                        <div>
                             <h3 className="text-lg font-semibold mb-4">Marketplace Sync</h3>
                            <div className="space-y-6">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                    </div>
                                ) : fields.length > 0 ? (
                                    fields.map((field, index) => {
                                        const isShopify = field.id === 'shopify';
                                        return (
                                        <div key={field.id}>
                                            <div className="flex items-center gap-3">
                                                <Image src={platformIconMap[field.id] || 'https://placehold.co/400'} alt={field.name} width={24} height={24} unoptimized/>
                                                <h4 className="font-semibold">{field.name}</h4>
                                                {isShopify && <Badge variant="outline">Source</Badge>}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-4 border rounded-lg">
                                                <FormField
                                                    control={form.control}
                                                    name={`marketplaces.${index}.syncInventory`}
                                                    render={({ field: formField }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                            <div className="space-y-0.5">
                                                                <FormLabel className="flex items-center gap-2"><Boxes className="h-4 w-4"/> Sync Inventory</FormLabel>
                                                            </div>
                                                            <FormControl><Switch disabled={isShopify} checked={formField.value} onCheckedChange={formField.onChange} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`marketplaces.${index}.syncPrice`}
                                                    render={({ field: formField }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                            <div className="space-y-0.5">
                                                                <FormLabel className="flex items-center gap-2"><ShoppingCart className="h-4 w-4"/> Sync Price</FormLabel>
                                                            </div>
                                                            <FormControl><Switch disabled={isShopify} checked={formField.value} onCheckedChange={formField.onChange} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`marketplaces.${index}.priceAdjustment`}
                                                    render={({ field: formField }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Price Adjustment</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                    <Input type="number" disabled={isShopify} {...formField} className="pl-8" />
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`marketplaces.${index}.autoUpdateInventory`}
                                                    render={({ field: formField }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                            <div className="space-y-0.5">
                                                                <FormLabel className="text-xs">Auto-Update Inv.</FormLabel>
                                                            </div>
                                                            <FormControl><Switch disabled={isShopify} checked={formField.value} onCheckedChange={formField.onChange} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`marketplaces.${index}.defaultInventory`}
                                                    render={({ field: formField }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Default Inventory</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Hash className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                    <Input type="number" disabled={isShopify} {...formField} className="pl-8" />
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground">No marketplaces are connected. Add credentials in your .env file to configure sync settings.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isSubmitting || isLoading}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save All Settings
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
        <p className="text-muted-foreground">Manage your application settings, branding, and synchronization rules.</p>
      </div>
      <UserProfileCard />
      <MarketplaceConnectionsCard />
      <GeneralSettings />
    </div>
  );
}
