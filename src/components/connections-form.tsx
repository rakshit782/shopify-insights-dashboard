
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
    handleSaveShopifyCredentials, 
    handleSaveAmazonCredentials, 
    handleSaveWalmartCredentials, 
    handleSaveEbayCredentials, 
    handleSaveEtsyCredentials, 
    handleSaveWayfairCredentials,
    handleGetCredentialStatuses
} from '@/app/actions';
import type { AmazonCredentials, WalmartCredentials, EbayCredentials, EtsyCredentials, WayfairCredentials } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Image from 'next/image';
import { Textarea } from './ui/textarea';

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
    return (
        <Dialog>
            <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                     <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
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
    const { toast } = useToast();
    const [connections, setConnections] = useState({
        shopify: false,
        amazon: false,
        walmart: false,
        ebay: false,
        etsy: false,
        wayfair: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    const [isSavingShopify, setIsSavingShopify] = useState(false);
    const [isSavingAmazon, setIsSavingAmazon] = useState(false);
    const [isSavingWalmart, setIsSavingWalmart] = useState(false);
    const [isSavingEbay, setIsSavingEbay] = useState(false);
    const [isSavingEtsy, setIsSavingEtsy] = useState(false);
    const [isSavingWayfair, setIsSavingWayfair] = useState(false);

    // Form states
    const [shopifyStoreName, setShopifyStoreName] = useState('');
    const [shopifyApiToken, setShopifyApiToken] = useState('');

    const [amazonProfileId, setAmazonProfileId] = useState('');
    const [amazonClientId, setAmazonClientId] = useState('');
    const [amazonClientSecret, setAmazonClientSecret] = useState('');
    const [amazonRefreshToken, setAmazonRefreshToken] = useState('');

    const [walmartClientId, setWalmartClientId] = useState('');
    const [walmartClientSecret, setWalmartClientSecret] = useState('');

    const [ebayAppId, setEbayAppId] = useState('');
    const [ebayCertId, setEbayCertId] = useState('');
    const [ebayDevId, setEbayDevId] = useState('');
    const [ebayOauthToken, setEbayOauthToken] = useState('');

    const [etsyKeystring, setEtsyKeystring] = useState('');

    const [wayfairClientId, setWayfairClientId] = useState('');
    const [wayfairClientSecret, setWayfairClientSecret] = useState('');

    const fetchStatuses = useCallback(async () => {
        setIsLoading(true);
        const result = await handleGetCredentialStatuses();
        if (result.success && result.statuses) {
            setConnections(prev => ({ ...prev, ...result.statuses }));
        } else {
             toast({ title: "Error", description: "Could not fetch connection statuses.", variant: "destructive" });
        }
        setIsLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);
    
    const onSaveShopify = async () => {
        setIsSavingShopify(true);
        const result = await handleSaveShopifyCredentials(shopifyStoreName, shopifyApiToken);
        if (result.success) {
            toast({ title: "Shopify Credentials Saved" });
            fetchStatuses(); // Re-fetch statuses
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
            fetchStatuses();
        } else {
            toast({ title: "Save Failed", description: result.error, variant: "destructive" });
        }
        setIsSavingAmazon(false);
    };

    const onSaveWalmart = async () => {
        setIsSavingWalmart(true);
        const result = await handleSaveWalmartCredentials({ client_id: walmartClientId, client_secret: walmartClientSecret });
        if (result.success) {
            toast({ title: "Walmart Credentials Saved" });
            fetchStatuses();
        } else {
            toast({ title: "Save Failed", description: result.error, variant: "destructive" });
        }
        setIsSavingWalmart(false);
    };

    const onSaveEbay = async () => {
        setIsSavingEbay(true);
        const result = await handleSaveEbayCredentials({ app_id: ebayAppId, cert_id: ebayCertId, dev_id: ebayDevId, oauth_token: ebayOauthToken });
        if (result.success) {
            toast({ title: "eBay Credentials Saved" });
            fetchStatuses();
        } else {
            toast({ title: "Save Failed", description: result.error, variant: "destructive" });
        }
        setIsSavingEbay(false);
    };
    
    const onSaveEtsy = async () => {
        setIsSavingEtsy(true);
        const result = await handleSaveEtsyCredentials({ keystring: etsyKeystring });
        if (result.success) {
            toast({ title: "Etsy Credentials Saved" });
            fetchStatuses();
        } else {
            toast({ title: "Save Failed", description: result.error, variant: "destructive" });
        }
        setIsSavingEtsy(false);
    };

    const onSaveWayfair = async () => {
        setIsSavingWayfair(true);
        const result = await handleSaveWayfairCredentials({ client_id: wayfairClientId, client_secret: wayfairClientSecret });
        if (result.success) {
            toast({ title: "Wayfair Credentials Saved" });
            fetchStatuses();
        } else {
            toast({ title: "Save Failed", description: result.error, variant: "destructive" });
        }
        setIsSavingWayfair(false);
    };

    if (isLoading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 6}).map((_, i) => (
                <Card key={i} className="animate-pulse h-48">
                    <CardHeader><div className="h-6 w-1/2 bg-muted rounded-md" /></CardHeader>
                    <CardContent><div className="h-4 w-3/4 bg-muted rounded-md" /></CardContent>
                    <CardFooter><div className="h-10 w-full bg-muted rounded-md" /></CardFooter>
                </Card>
            ))}
        </div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Shopify */}
            <MarketplaceCard
                logo={<Image src="/shopify.svg" alt="Shopify Logo" width={48} height={48} unoptimized />}
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
                logo={<Image src="/amazon.svg" alt="Amazon Logo" width={48} height={48} unoptimized />}
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
                logo={<Image src="/walmart.svg" alt="Walmart Logo" width={48} height={48} unoptimized />}
                name="Walmart"
                description="Sync with Walmart Marketplace."
                isConnected={connections.walmart}
            >
                 <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Walmart Marketplace</DialogTitle>
                        <DialogDescription>Enter your Client ID and Client Secret (Private Key) for Walmart API access.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="walmart-client-id">Client ID</Label>
                            <Input id="walmart-client-id" placeholder="Enter your Walmart Client ID" value={walmartClientId} onChange={e => setWalmartClientId(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="walmart-client-secret">Client Secret (PKCS8 Private Key)</Label>
                            <Textarea id="walmart-client-secret" placeholder="Paste your full private key here, including the -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- lines." value={walmartClientSecret} onChange={e => setWalmartClientSecret(e.target.value)} rows={8} />
                             <p className="text-xs text-muted-foreground">This is your Base64 encoded PKCS8 private key.</p>
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
                logo={<Image src="/ebay.svg" alt="eBay Logo" width={48} height={48} unoptimized />}
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
                            <Input id="ebay-app-id" placeholder="Enter your eBay App ID" value={ebayAppId} onChange={e => setEbayAppId(e.target.value)}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ebay-cert-id">Cert ID (Client Secret)</Label>
                            <Input id="ebay-cert-id" type="password" placeholder="Enter your eBay Cert ID" value={ebayCertId} onChange={e => setEbayCertId(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ebay-dev-id">Dev ID</Label>
                            <Input id="ebay-dev-id" placeholder="Enter your eBay Dev ID" value={ebayDevId} onChange={e => setEbayDevId(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="ebay-oauth-token">OAuth User Token</Label>
                            <Input id="ebay-oauth-token" type="password" placeholder="Enter your OAuth User Token" value={ebayOauthToken} onChange={e => setEbayOauthToken(e.target.value)} />
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
                logo={<Image src="/etsy.svg" alt="Etsy Logo" width={48} height={48} unoptimized />}
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
                            <Input id="etsy-keystring" placeholder="Enter your Etsy API Keystring" value={etsyKeystring} onChange={e => setEtsyKeystring(e.target.value)} />
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
                logo={<Image src="/wayfair.svg" alt="Wayfair Logo" width={48} height={48} unoptimized />}
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
                            <Input id="wayfair-client-id" placeholder="Enter your Wayfair Client ID" value={wayfairClientId} onChange={e => setWayfairClientId(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="wayfair-client-secret">Client Secret</Label>
                            <Input id="wayfair-client-secret" type="password" placeholder="Enter your Wayfair Client Secret" value={wayfairClientSecret} onChange={e => setWayfairClientSecret(e.target.value)} />
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
