
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleSaveShopifyCredentials, handleSaveAmazonCredentials, handleSaveWalmartCredentials, handleSaveEbayCredentials, handleSaveEtsyCredentials, handleSaveWayfairCredentials } from '@/app/actions';
import type { AmazonCredentials } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, RefreshCw, Trash2, CheckCircle, XCircle } from "lucide-react";
import Image from 'next/image';

const MarketplaceCard = ({
    logo,
    name,
    description,
    isConnected,
    children
}: {
    logo: React.ReactNode,
    name: string,
    description: string,
    isConnected: boolean,
    children: React.ReactNode
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="w-12 h-12 flex items-center justify-center">
                        {logo}
                    </div>
                    <div className="flex-1">
                        <CardTitle>{name}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${isConnected ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {isConnected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span>{isConnected ? 'Connected' : 'Not Connected'}</span>
                    </div>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <DialogTrigger asChild>
                        <Button className="w-full">Manage</Button>
                    </DialogTrigger>
                </CardFooter>
            </Card>
            {children}
        </Dialog>
    );
};

export function ConnectionsForm() {
    // In a real app, you'd fetch the connection status for each platform
    const [connections, setConnections] = useState({
        shopify: false,
        amazon: false,
        walmart: false,
        ebay: false,
        etsy: false,
        wayfair: false,
    });

    useEffect(() => {
        // Mock fetching connection statuses
        // In a real app, you would check if valid credentials exist in Supabase
        setConnections({
            shopify: true, // Let's assume Shopify is connected
            amazon: false,
            walmart: false,
            ebay: false,
            etsy: false,
            wayfair: false,
        })
    }, []);

    const { toast } = useToast();
    const [isSavingShopify, setIsSavingShopify] = useState(false);
    const [isSavingAmazon, setIsSavingAmazon] = useState(false);
    const [isSavingWalmart, setIsSavingWalmart] = useState(false);
    const [isSavingEbay, setIsSavingEbay] = useState(false);
    const [isSavingEtsy, setIsSavingEtsy] = useState(false);
    const [isSavingWayfair, setIsSavingWayfair] = useState(false);

    const [shopifyStoreName, setShopifyStoreName] = useState('');
    const [shopifyApiToken, setShopifyApiToken] = useState('');

    const [amazonProfileId, setAmazonProfileId] = useState('');
    const [amazonClientId, setAmazonClientId] = useState('');
    const [amazonClientSecret, setAmazonClientSecret] = useState('');
    const [amazonRefreshToken, setAmazonRefreshToken] = useState('');

    const onSaveShopify = async () => {
        setIsSavingShopify(true);
        const result = await handleSaveShopifyCredentials(shopifyStoreName, shopifyApiToken);
        if (result.success) {
            toast({ title: "Shopify Credentials Saved" });
            setConnections(prev => ({...prev, shopify: true}));
        } else {
            toast({ title: "Save Failed", description: result.error, variant: "destructive" });
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
        const result = await handleSaveAmazonCredentials(creds);
        if (result.success) {
            toast({ title: "Amazon Credentials Saved" });
            setConnections(prev => ({...prev, amazon: true}));
        } else {
            toast({ title: "Save Failed", description: result.error, variant: "destructive" });
        }
        setIsSavingAmazon(false);
    };

    // Placeholder save handlers
    const onSaveWalmart = async () => { setIsSavingWalmart(true); await new Promise(r => setTimeout(r, 1000)); setIsSavingWalmart(false); toast({title: "Placeholder", description: "Saving Walmart credentials is not implemented."}) };
    const onSaveEbay = async () => { setIsSavingEbay(true); await new Promise(r => setTimeout(r, 1000)); setIsSavingEbay(false); toast({title: "Placeholder", description: "Saving eBay credentials is not implemented."}) };
    const onSaveEtsy = async () => { setIsSavingEtsy(true); await new Promise(r => setTimeout(r, 1000)); setIsSavingEtsy(false); toast({title: "Placeholder", description: "Saving Etsy credentials is not implemented."}) };
    const onSaveWayfair = async () => { setIsSavingWayfair(true); await new Promise(r => setTimeout(r, 1000)); setIsSavingWayfair(false); toast({title: "Placeholder", description: "Saving Wayfair credentials is not implemented."}) };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Shopify */}
            <MarketplaceCard
                logo={<Image src="/shopify.svg" alt="Shopify Logo" width={40} height={40} className="h-auto w-auto" />}
                name="Shopify"
                description="Manage your primary e-commerce storefront."
                isConnected={connections.shopify}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Shopify Connection</DialogTitle>
                        <DialogDescription>
                            Enter your Shopify store name and Admin API access token. These are stored securely.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="shopify-store-name">Store Name</Label>
                            <div className="flex items-center">
                                <Input id="shopify-store-name" placeholder="your-store" value={shopifyStoreName} onChange={(e) => setShopifyStoreName(e.target.value)} />
                                <span className="ml-2 text-muted-foreground">.myshopify.com</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shopify-api-token">Admin API Access Token</Label>
                            <Input id="shopify-api-token" type="password" placeholder="shpat_..." value={shopifyApiToken} onChange={(e) => setShopifyApiToken(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={onSaveShopify} disabled={isSavingShopify}>
                            {isSavingShopify ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Connection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </MarketplaceCard>

            {/* Amazon */}
            <MarketplaceCard
                logo={<Image src="/amazon.svg" alt="Amazon Logo" width={40} height={40} className="h-auto w-auto" />}
                name="Amazon"
                description="Connect your Seller Central account."
                isConnected={connections.amazon}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Amazon Seller Central</DialogTitle>
                        <DialogDescription>Add credentials for each Amazon region you sell in.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
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
                            <Input id="amazon-refresh-token" type="password" value={amazonRefreshToken} onChange={e => setAmazonRefreshToken(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={onSaveAmazon} disabled={isSavingAmazon}>
                            {isSavingAmazon ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Connection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </MarketplaceCard>
            
            {/* Walmart */}
            <MarketplaceCard
                logo={<Image src="/walmart.svg" alt="Walmart Logo" width={40} height={40} className="h-auto w-auto" />}
                name="Walmart"
                description="Sync with Walmart Marketplace."
                isConnected={connections.walmart}
            >
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Walmart Marketplace</DialogTitle>
                        <DialogDescription>Enter your Client ID and Client Secret for Walmart API access.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="walmart-client-id">Client ID</Label>
                            <Input id="walmart-client-id" placeholder="Enter your Walmart Client ID" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="walmart-client-secret">Client Secret</Label>
                            <Input id="walmart-client-secret" type="password" placeholder="Enter your Walmart Client Secret" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={onSaveWalmart} disabled={isSavingWalmart}>
                            {isSavingWalmart ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Connection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </MarketplaceCard>

             {/* eBay */}
            <MarketplaceCard
                logo={<Image src="/ebay.svg" alt="eBay Logo" width={40} height={40} className="h-auto w-auto" />}
                name="eBay"
                description="List products on the eBay platform."
                isConnected={connections.ebay}
            >
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>eBay Connection</DialogTitle>
                        <DialogDescription>Provide your eBay API credentials for the desired environment.</DialogDescription>
                    </DialogHeader>
                     <div className="space-y-4 py-4">
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
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                         <Button onClick={onSaveEbay} disabled={isSavingEbay}>
                            {isSavingEbay ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Connection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </MarketplaceCard>

            {/* Etsy */}
            <MarketplaceCard
                logo={<Image src="/etsy.svg" alt="Etsy Logo" width={40} height={40} className="h-auto w-auto" />}
                name="Etsy"
                description="Connect your creative marketplace."
                isConnected={connections.etsy}
            >
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Etsy Connection</DialogTitle>
                        <DialogDescription>Enter your Etsy API Keystring.</DialogDescription>
                    </DialogHeader>
                     <div className="space-y-4 py-4">
                       <div className="space-y-2">
                            <Label htmlFor="etsy-keystring">API Keystring</Label>
                            <Input id="etsy-keystring" placeholder="Enter your Etsy API Keystring" />
                        </div>
                         <p className="text-sm text-muted-foreground pt-2">
                            Etsy uses an API Key (Keystring) for authentication. You can generate one in your Etsy Developer account.
                        </p>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                         <Button onClick={onSaveEtsy} disabled={isSavingEtsy}>
                            {isSavingEtsy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Connection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </MarketplaceCard>

            {/* Wayfair */}
            <MarketplaceCard
                logo={<Image src="/wayfair.svg" alt="Wayfair Logo" width={40} height={40} className="w-auto h-auto" />}
                name="Wayfair"
                description="Manage your home goods products."
                isConnected={connections.wayfair}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Wayfair Connection</DialogTitle>
                        <DialogDescription>Provide your Wayfair API Client ID and Client Secret.</DialogDescription>
                    </DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="wayfair-client-id">Client ID</Label>
                            <Input id="wayfair-client-id" placeholder="Enter your Wayfair Client ID" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="wayfair-client-secret">Client Secret</Label>
                            <Input id="wayfair-client-secret" type="password" placeholder="Enter your Wayfair Client Secret" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={onSaveWayfair} disabled={isSavingWayfair}>
                            {isSavingWayfair ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Connection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </MarketplaceCard>

        </div>
    )
}

    

    
