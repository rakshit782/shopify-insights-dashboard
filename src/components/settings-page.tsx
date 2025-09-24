
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleGetOrCreateUser } from '@/app/actions';
import type { User, Profile } from '@/lib/types';

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

export function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your application settings.</p>
      </div>
      <UserProfileCard />
    </div>
  );
}
