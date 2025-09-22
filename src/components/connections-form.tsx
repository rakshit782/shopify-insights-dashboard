
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleSaveShopifyCredentials, handleSaveAmazonCredentials, handleSaveWalmartCredentials, handleSaveEbayCredentials, handleSaveEtsyCredentials, handleSaveWayfairCredentials } from '@/app/actions';
import type { AmazonCredentials } from '@/lib/types';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator";
import { PlusCircle, RefreshCw, Trash2, Loader2 } from "lucide-react";


export function ConnectionsForm() {
    const { toast } = useToast();
    const [isSavingShopify, setIsSavingShopify] = useState(false);
    const [isSavingAmazon, setIsSavingAmazon] = useState(false);
    const [isSavingWalmart, setIsSavingWalmart] = useState(false);
    const [isSavingEbay, setIsSavingEbay] = useState(false);
    const [isSavingEtsy, setIsSavingEtsy] = useState(false);
    const [isSavingWayfair, setIsSavingWayfair] = useState(false);

    // Shopify state
    const [shopifyStoreName, setShopifyStoreName] = useState('');
    const [shopifyApiToken, setShopifyApiToken] = useState('');
    
    // Amazon State
    const [amazonProfileId, setAmazonProfileId] = useState('');
    const [amazonClientId, setAmazonClientId] = useState('');
    const [amazonClientSecret, setAmazonClientSecret] = useState('');
    const [amazonRefreshToken, setAmazonRefreshToken] = useState('');


    const onSaveShopify = async () => {
        setIsSavingShopify(true);
        if (!shopifyStoreName || !shopifyApiToken) {
            toast({
                title: "Missing Information",
                description: "Please provide both a store name and an access token.",
                variant: "destructive",
            });
            setIsSavingShopify(false);
            return;
        }

        const result = await handleSaveShopifyCredentials(shopifyStoreName, shopifyApiToken);
        
        if (result.success) {
            toast({
                title: "Credentials Saved",
                description: "Your Shopify credentials have been saved successfully.",
                variant: "default",
            });
        } else {
             toast({
                title: "Save Failed",
                description: result.error,
                variant: "destructive",
            });
        }
        setIsSavingShopify(false);
    };

    const onSaveAmazon = async () => {
        setIsSavingAmazon(true);

        const creds: AmazonCredentials = {
            profile_id: amazonProfileId,
            client_id: amazonClientId,
            client_secret: amazonClientSecret,
            refresh_token: amazonRefreshToken,
        };

        if (Object.values(creds).some(v => !v)) {
             toast({
                title: "Missing Information",
                description: "Please fill out all fields for Amazon credentials.",
                variant: "destructive",
            });
            setIsSavingAmazon(false);
            return;
        }

        const result = await handleSaveAmazonCredentials(creds);

         if (result.success) {
            toast({
                title: "Credentials Saved",
                description: "Your Amazon credentials have been saved successfully.",
                variant: "default",
            });
        } else {
             toast({
                title: "Save Failed",
                description: result.error,
                variant: "destructive",
            });
        }
        setIsSavingAmazon(false);
    };

    const onSaveWalmart = async () => {
        setIsSavingWalmart(true);
        // Placeholder for actual logic
        const result = await handleSaveWalmartCredentials({});
         toast({
            title: "Action Placeholder",
            description: "Saving Walmart credentials is not yet implemented.",
        });
        setIsSavingWalmart(false);
    };

    const onSaveEbay = async () => {
        setIsSavingEbay(true);
        const result = await handleSaveEbayCredentials({});
        toast({
            title: "Action Placeholder",
            description: "Saving eBay credentials is not yet implemented.",
        });
        setIsSavingEbay(false);
    };
    
    const onSaveEtsy = async () => {
        setIsSavingEtsy(true);
        const result = await handleSaveEtsyCredentials({});
        toast({
            title: "Action Placeholder",
            description: "Saving Etsy credentials is not yet implemented.",
        });
        setIsSavingEtsy(false);
    };

    const onSaveWayfair = async () => {
        setIsSavingWayfair(true);
        const result = await handleSaveWayfairCredentials({});
        toast({
            title: "Action Placeholder",
            description: "Saving Wayfair credentials is not yet implemented.",
        });
        setIsSavingWayfair(false);
    };

    const renderShopifyForm = () => (
        <Card>
            <CardHeader>
                <CardTitle>Shopify</CardTitle>
                <CardDescription>
                    Enter your Shopify store name and Admin API access token. These are stored securely.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="shopify-store-name">Store Name</Label>
                    <div className="flex items-center">
                        <Input 
                            id="shopify-store-name" 
                            placeholder="your-store" 
                            value={shopifyStoreName}
                            onChange={(e) => setShopifyStoreName(e.target.value)}
                        />
                        <span className="ml-2 text-muted-foreground">.myshopify.com</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shopify-api-token">Admin API Access Token</Label>
                    <Input 
                        id="shopify-api-token" 
                        type="password" 
                        placeholder="shpat_..." 
                        value={shopifyApiToken}
                        onChange={(e) => setShopifyApiToken(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onSaveShopify} disabled={isSavingShopify}>
                    {isSavingShopify ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Shopify Credentials
                </Button>
            </CardFooter>
        </Card>
    );

    const renderAmazonForm = () => (
         <Card>
            <CardHeader>
                <CardTitle>Amazon Seller Central</CardTitle>
                <CardDescription>
                    Add credentials for each Amazon region you sell in.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Example of one region, this would be dynamic in a real multi-region setup */}
                <div className="p-4 border rounded-lg space-y-4">
                     <div className="flex justify-between items-center">
                        <h4 className="font-semibold">North America (NA)</h4>
                        <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="amazon-profile-id">Profile ID</Label>
                        <Input id="amazon-profile-id" placeholder="eg. 1234567890" value={amazonProfileId} onChange={e => setAmazonProfileId(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="amazon-client-id">Client ID</Label>
                        <Input id="amazon-client-id" placeholder="amzn1.application-oa2-client.123..." value={amazonClientId} onChange={e => setAmazonClientId(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="amazon-client-secret">Client Secret</Label>
                        <Input id="amazon-client-secret" type="password" value={amazonClientSecret} onChange={e => setAmazonClientSecret(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="amazon-refresh-token">Refresh Token</Label>
                        <div className="flex items-center gap-2">
                            <Input id="amazon-refresh-token" type="password" value={amazonRefreshToken} onChange={e => setAmazonRefreshToken(e.target.value)} />
                            <Button variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Rotate Secret
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            It is recommended to rotate your client secret periodically.
                        </p>
                    </div>
                </div>
                <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Another Region
                </Button>
            </CardContent>
            <CardFooter>
                <Button onClick={onSaveAmazon} disabled={isSavingAmazon}>
                    {isSavingAmazon ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Amazon Credentials
                </Button>
            </CardFooter>
        </Card>
    );

    const renderWalmartForm = () => (
        <Card>
            <CardHeader>
                <CardTitle>Walmart Marketplace</CardTitle>
                <CardDescription>
                    Enter your Client ID and Client Secret for Walmart API access.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="walmart-client-id">Client ID</Label>
                    <Input id="walmart-client-id" placeholder="Enter your Walmart Client ID" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="walmart-client-secret">Client Secret</Label>
                    <Input id="walmart-client-secret" type="password" placeholder="Enter your Walmart Client Secret" />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onSaveWalmart} disabled={isSavingWalmart}>
                    {isSavingWalmart ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Walmart Credentials
                </Button>
            </CardFooter>
        </Card>
    );

    const renderEbayForm = () => (
        <Card>
            <CardHeader>
                <CardTitle>eBay</CardTitle>
                <CardDescription>
                    Provide your eBay API credentials for the desired environment.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ebay-app-id">App ID (Client ID)</Label>
                    <Input id="ebay-app-id" placeholder="Enter your eBay App ID" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ebay-cert-id">Cert ID (Client Secret)</Label>
                    <Input id="ebay-cert-id" type="password" placeholder="Enter your eBay Cert ID" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ebay-dev-id">Dev ID</Label>
                    <Input id="ebay-dev-id" placeholder="Enter your eBay Dev ID" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="ebay-oauth-token">OAuth User Token</Label>
                    <Input id="ebay-oauth-token" type="password" placeholder="Enter your OAuth User Token" />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onSaveEbay} disabled={isSavingEbay}>
                     {isSavingEbay ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save eBay Credentials
                </Button>
            </CardFooter>
        </Card>
    );

    const renderEtsyForm = () => (
        <Card>
            <CardHeader>
                <CardTitle>Etsy</CardTitle>
                <CardDescription>
                    Enter your Etsy API Keystring.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="etsy-keystring">API Keystring</Label>
                    <Input id="etsy-keystring" placeholder="Enter your Etsy API Keystring" />
                </div>
                 <p className="text-sm text-muted-foreground pt-2">
                    Etsy uses an API Key (Keystring) for authentication. You can generate one in your Etsy Developer account.
                </p>
            </CardContent>
            <CardFooter>
                <Button onClick={onSaveEtsy} disabled={isSavingEtsy}>
                    {isSavingEtsy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Etsy Credentials
                </Button>
            </CardFooter>
        </Card>
    );

     const renderWayfairForm = () => (
        <Card>
            <CardHeader>
                <CardTitle>Wayfair</CardTitle>
                <CardDescription>
                    Provide your Wayfair API Client ID and Client Secret.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="wayfair-client-id">Client ID</Label>
                    <Input id="wayfair-client-id" placeholder="Enter your Wayfair Client ID" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="wayfair-client-secret">Client Secret</Label>
                    <Input id="wayfair-client-secret" type="password" placeholder="Enter your Wayfair Client Secret" />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onSaveWayfair} disabled={isSavingWayfair}>
                    {isSavingWayfair ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Wayfair Credentials
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">Shopify</AccordionTrigger>
                <AccordionContent className="pt-4">
                    {renderShopifyForm()}
                </AccordionContent>
            </AccordionItem>
            <Separator />
            <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">Amazon</AccordionTrigger>
                <AccordionContent className="pt-4">
                   {renderAmazonForm()}
                </AccordionContent>
            </AccordionItem>
             <Separator />
            <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">Walmart</AccordionTrigger>
                <AccordionContent className="pt-4">
                    {renderWalmartForm()}
                </AccordionContent>
            </AccordionItem>
             <Separator />
             <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">eBay</AccordionTrigger>
                <AccordionContent className="pt-4">
                    {renderEbayForm()}
                </AccordionContent>
            </AccordionItem>
             <Separator />
             <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">Etsy</AccordionTrigger>
                <AccordionContent className="pt-4">
                    {renderEtsyForm()}
                </AccordionContent>
            </AccordionItem>
             <Separator />
             <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">Wayfair</AccordionTrigger>
                <AccordionContent className="pt-4">
                    {renderWayfairForm()}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
