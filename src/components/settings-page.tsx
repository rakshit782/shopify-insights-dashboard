
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BusinessProfileForm } from '@/components/business-profile-form';
import { handleGetBusinessProfiles } from '@/app/actions';
import type { BusinessProfile } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Settings, Check, X, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ConnectionsDialog } from './connections-dialog';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const platformMeta: { [key: string]: { name: string; icon: React.ReactNode } } = {
    'shopify': { name: 'Shopify', icon: <Image src="/shopify.svg" alt="Shopify" width={24} height={24} unoptimized /> },
    'amazon': { name: 'Amazon', icon: <Image src="/amazon.svg" alt="Amazon" width={24} height={24} unoptimized /> },
    'walmart': { name: 'Walmart', icon: <Image src="/walmart.svg" alt="Walmart" width={24} height={24} unoptimized /> },
    'ebay': { name: 'eBay', icon: <Image src="/ebay.svg" alt="eBay" width={24} height={24} unoptimized /> },
    'etsy': { name: 'Etsy', icon: <Image src="/etsy.svg" alt="Etsy" width={24} height={24} unoptimized /> },
    'wayfair': { name: 'Wayfair', icon: <Image src="/wayfair.svg" alt="Wayfair" width={24} height={24} unoptimized /> },
};


export function SettingsPage() {
    const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    const fetchProfiles = async () => {
        setIsLoading(true);
        const result = await handleGetBusinessProfiles();
        if (result.success && result.profiles) {
            setProfiles(result.profiles);
            if (view === 'list' && result.profiles.length > 0 && !selectedProfileId) {
                setSelectedProfileId(result.profiles[0].id);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleProfileCreated = (newProfile: BusinessProfile) => {
        setProfiles(prev => [...prev, newProfile]);
        setSelectedProfileId(newProfile.id);
        setView('list');
    }
    
    const handleProfileUpdated = (updatedProfile: BusinessProfile) => {
        setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
        setView('list');
    }

    const handleConfigure = (platformId: string) => {
        setSelectedPlatform(platformId);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (credentialsSaved: boolean) => {
        setIsDialogOpen(false);
        setSelectedPlatform(null);
        if (credentialsSaved) {
            fetchProfiles(); // Re-fetch all profiles to get updated statuses
        }
    };


    const selectedProfile = profiles.find(p => p.id === selectedProfileId) || null;

    const renderConnectionCard = (profile: BusinessProfile) => (
         <Card>
            <CardHeader>
                <CardTitle>Marketplace Connections</CardTitle>
                <CardDescription>Manage API credentials for "{profile.profile_name}".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.keys(platformMeta).map(platformId => {
                    const isConnected = profile.credential_statuses ? profile.credential_statuses[platformId] : false;
                    return (
                        <div key={platformId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-4">
                                {platformMeta[platformId].icon}
                                <span className="font-medium">{platformMeta[platformId].name}</span>
                            </div>
                             <div className="flex items-center gap-4">
                                <div className={cn("flex items-center gap-2 text-sm", isConnected ? "text-green-600" : "text-muted-foreground")}>
                                   {isConnected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                   {isConnected ? 'Connected' : 'Not Connected'}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleConfigure(platformId)}>
                                    {isConnected ? 'Configure' : 'Connect'}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );

    const renderContent = () => {
        if (isLoading) {
            return <Skeleton className="h-[400px] w-full" />
        }

        if (view === 'form') {
            return (
                 <BusinessProfileForm 
                    key={selectedProfile?.id || 'new'}
                    profile={selectedProfile} 
                    onProfileCreated={handleProfileCreated}
                    onProfileUpdated={handleProfileUpdated}
                    onCancel={() => setView('list')}
                />
            )
        }

        if (profiles.length === 0) {
            return (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                     <h3 className="text-xl font-semibold">No Business Profiles</h3>
                     <p className="text-muted-foreground mt-2">Get started by creating your first profile.</p>
                     <Button className="mt-4" onClick={() => { setSelectedProfileId(null); setView('form'); }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Profile
                    </Button>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Business Profiles</CardTitle>
                                <CardDescription>Select a profile to view or edit its settings and connections.</CardDescription>
                            </div>
                            <Button variant="outline" className="mt-4 sm:mt-0" onClick={() => { setSelectedProfileId(null); setView('form'); }}>
                                <PlusCircle className="mr-2 h-4 w-4" /> New Profile
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            {profiles.map(profile => (
                                <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                    <div>
                                        <p className="font-semibold">{profile.profile_name}</p>
                                        <p className="text-sm text-muted-foreground">{profile.store_url}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => { setSelectedProfileId(profile.id); setView('form'); }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                {selectedProfile && renderConnectionCard(selectedProfile)}
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your business profiles and application settings.</p>
            </div>

            {renderContent()}

            {selectedProfile && selectedPlatform && (
                <ConnectionsDialog
                    profileId={selectedProfile.id}
                    platform={selectedPlatform}
                    isOpen={isDialogOpen}
                    onClose={handleDialogClose}
                />
            )}
        </div>
    );
}

    