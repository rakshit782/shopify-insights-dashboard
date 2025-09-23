
import { handleGetUserAgency } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Terminal, User, Building, Fingerprint } from 'lucide-react';

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | null | undefined }) {
    return (
        <div className="flex items-center gap-4">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value || 'Not available'}</p>
            </div>
        </div>
    );
}

export function UserProfileCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export async function UserProfileCard() {
    const { success, email, agency, error } = await handleGetUserAgency();

    if (error) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Could Not Load User Profile</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Your account and agency information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <InfoRow icon={User} label="Email Address" value={email} />
                <InfoRow icon={Building} label="Agency Name" value={agency?.name || 'Not assigned'} />
                <InfoRow icon={Fingerprint} label="Agency ID" value={agency?.agency_id} />
            </CardContent>
        </Card>
    );
}
