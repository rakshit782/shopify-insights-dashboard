
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessProfileForm } from '@/components/business-profile-form';
import { handleGetBusinessProfiles } from '@/app/actions';
import type { BusinessProfile } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import { Button } from './ui/button';

export function SettingsPage() {
    const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProfiles() {
            setIsLoading(true);
            const result = await handleGetBusinessProfiles();
            if (result.success && result.profiles) {
                setProfiles(result.profiles);
                if (result.profiles.length > 0) {
                    setSelectedProfileId(result.profiles[0].id);
                }
            }
            setIsLoading(false);
        }
        fetchProfiles();
    }, []);

    const handleProfileCreated = (newProfile: BusinessProfile) => {
        setProfiles(prev => [...prev, newProfile]);
        setSelectedProfileId(newProfile.id);
    }
    
    const handleProfileUpdated = (updatedProfile: BusinessProfile) => {
        setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    }

    const selectedProfile = profiles.find(p => p.id === selectedProfileId) || null;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your business profiles and application settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Business Profiles</CardTitle>
                    <CardDescription>Select a profile to edit or create a new one.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        {isLoading ? (
                            <Skeleton className="h-10 w-full sm:w-64" />
                        ) : profiles.length > 0 ? (
                           <Select value={selectedProfileId || ''} onValueChange={setSelectedProfileId}>
                                <SelectTrigger className="w-full sm:w-64">
                                    <SelectValue placeholder="Select a profile" />
                                </SelectTrigger>
                                <SelectContent>
                                    {profiles.map(profile => (
                                        <SelectItem key={profile.id} value={profile.id}>
                                            {profile.profile_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-muted-foreground">No profiles found.</p>
                        )}
                         <Button variant="outline" onClick={() => setSelectedProfileId('new')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    </CardContent>
                </Card>
            ) : (
                (selectedProfile || selectedProfileId === 'new') && (
                    <BusinessProfileForm 
                        key={selectedProfile?.id || 'new'}
                        profile={selectedProfile} 
                        onProfileCreated={handleProfileCreated}
                        onProfileUpdated={handleProfileUpdated}
                    />
                )
            )}
        </div>
    );
}
