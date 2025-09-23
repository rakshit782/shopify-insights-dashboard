
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { handleSaveShopifyCredentials, handleSaveAmazonCredentials, handleSaveWalmartCredentials, handleSaveEbayCredentials, handleSaveEtsyCredentials, handleSaveWayfairCredentials } from '@/app/actions';
import Image from 'next/image';
import Link from 'next/link';

interface ConnectionsDialogProps {
  platform: string;
  isOpen: boolean;
  onClose: (credentialsSaved: boolean) => void;
}

const platformMeta: { [key: string]: { name: string; icon: React.ReactNode; schema: z.ZodObject<any>; helpLink: string; } } = {
  shopify: {
    name: 'Shopify',
    icon: <Image src="/shopify.svg" alt="Shopify" width={24} height={24} unoptimized />,
    schema: z.object({
      storeName: z.string().min(1, 'Store Name is required.').refine(val => !val.includes('.'), "Enter the name only, not the full URL (e.g., 'my-store' instead of 'my-store.myshopify.com')."),
      accessToken: z.string().min(1, 'Admin API access token is required.'),
    }),
    helpLink: 'https://help.shopify.com/en/manual/apps/custom-apps',
  },
  amazon: {
    name: 'Amazon',
    icon: <Image src="/amazon.svg" alt="Amazon" width={24} height={24} unoptimized />,
    schema: z.object({
      clientId: z.string().min(1, 'Client ID is required.'),
      clientSecret: z.string().min(1, 'Client Secret is required.'),
      refreshToken: z.string().min(1, 'Refresh Token is required.'),
      profileId: z.string().min(1, 'Profile ID is required.'),
      sellerId: z.string().min(1, 'Seller ID is required.'),
      marketplaceId: z.string().min(1, 'Marketplace ID is required.'),
    }),
    helpLink: 'https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api',
  },
  walmart: {
    name: 'Walmart',
    icon: <Image src="/walmart.svg" alt="Walmart" width={24} height={24} unoptimized />,
    schema: z.object({
      clientId: z.string().min(1, 'Client ID is required.'),
      clientSecret: z.string().min(1, 'Client Secret is required.'),
    }),
    helpLink: 'https://developer.walmart.com/documentation/authentication-and-authorization/production-keys/',
  },
  ebay: {
    name: 'eBay',
    icon: <Image src="/ebay.svg" alt="eBay" width={24} height={24} unoptimized />,
    schema: z.object({
      appId: z.string().min(1, 'App ID is required.'),
      certId: z.string().min(1, 'Cert ID is required.'),
      devId: z.string().min(1, 'Dev ID is required.'),
      oauthToken: z.string().min(1, 'OAuth Token is required.'),
    }),
    helpLink: 'https://developer.ebay.com/api-docs/static/oauth-tokens.html',
  },
  etsy: {
    name: 'Etsy',
    icon: <Image src="/etsy.svg" alt="Etsy" width={24} height={24} unoptimized />,
    schema: z.object({
      keystring: z.string().min(1, 'Keystring is required.'),
    }),
    helpLink: 'https://www.etsy.com/developers/documentation/getting_started/api_basics#section_register_as_a_developer',
  },
  wayfair: {
    name: 'Wayfair',
    icon: <Image src="/wayfair.svg" alt="Wayfair" width={24} height={24} unoptimized />,
    schema: z.object({
      clientId: z.string().min(1, 'Client ID is required.'),
      clientSecret: z.string().min(1, 'Client Secret is required.'),
    }),
    helpLink: 'https://developer.wayfair.com/docs/authorization-and-authentication',
  },
};

const actionMap: { [key: string]: (data: any) => Promise<any> } = {
  shopify: (data) => handleSaveShopifyCredentials(data.storeName, data.accessToken),
  amazon: handleSaveAmazonCredentials,
  walmart: handleSaveWalmartCredentials,
  ebay: handleSaveEbayCredentials,
  etsy: handleSaveEtsyCredentials,
  wayfair: handleSaveWayfairCredentials,
};

const defaultValuesMap: { [key: string]: any } = {
    shopify: { storeName: '', accessToken: '' },
    amazon: { clientId: '', clientSecret: '', refreshToken: '', profileId: '', sellerId: '', marketplaceId: ''},
    walmart: { clientId: '', clientSecret: '' },
    ebay: { appId: '', certId: '', devId: '', oauthToken: '' },
    etsy: { keystring: '' },
    wayfair: { clientId: '', clientSecret: '' },
}

export function ConnectionsDialog({ platform, isOpen, onClose }: ConnectionsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const platformInfo = platformMeta[platform];

  const form = useForm({
    resolver: zodResolver(platformInfo.schema),
    defaultValues: defaultValuesMap[platform],
  });

  const onSubmit = async (values: z.infer<typeof platformInfo.schema>) => {
    setIsSubmitting(true);
    
    const saveAction = actionMap[platform];
    const result = await saveAction(values);

    if (result.success) {
      toast({
        title: 'Credentials Saved',
        description: `Your ${platformInfo.name} credentials have been successfully saved.`,
      });
      onClose(true);
    } else {
      toast({
        title: 'Save Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };
  
  const renderField = (fieldName: string, label: string, isPassword=false) => (
    <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <Input type={isPassword ? "password" : "text"} {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
  )

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
             {platformInfo.icon}
             Connect to {platformInfo.name}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span>Enter your API credentials to connect your {platformInfo.name} store.</span>
             <Link href={platformInfo.helpLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-500 hover:underline">
                <LinkIcon className="mr-1 h-3 w-3" />
                Need help finding these?
            </Link>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             {platform === 'shopify' && <>
                {renderField("storeName", "Shopify Store Name")}
                {renderField("accessToken", "Admin API Access Token", true)}
             </>}
             {platform === 'amazon' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderField("sellerId", "Seller ID")}
                {renderField("marketplaceId", "Marketplace ID")}
                {renderField("profileId", "Profile ID")}
                {renderField("clientId", "Client ID")}
                {renderField("clientSecret", "Client Secret", true)}
                {renderField("refreshToken", "Refresh Token", true)}
             </div>}
             {platform === 'walmart' && <>
                {renderField("clientId", "Client ID")}
                {renderField("clientSecret", "Client Secret", true)}
             </>}
             {platform === 'ebay' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderField("appId", "App ID")}
                {renderField("certId", "Cert ID")}
                {renderField("devId", "Dev ID")}
                {renderField("oauthToken", "OAuth Token", true)}
             </div>}
             {platform === 'etsy' && <>
                {renderField("keystring", "Keystring")}
             </>}
              {platform === 'wayfair' && <>
                {renderField("clientId", "Client ID")}
                {renderField("clientSecret", "Client Secret", true)}
             </>}
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save & Connect'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
