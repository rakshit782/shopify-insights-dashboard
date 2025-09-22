
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo } from 'lucide-react';

export default function ListingManagerPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Listing Manager</h1>
                <p className="text-muted-foreground">
                    Manage your product listings across all channels from one place.
                </p>
            </div>

            <Card className="min-h-[60vh]">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section will house the PIM-lite and central catalog management features.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                    <ListTodo className="h-16 w-16 mb-4" />
                    <p className="text-lg font-semibold">Bulk editing and channel overrides are on the way.</p>
                    <p className="mt-2 max-w-md">
                        You'll soon be able to manage channel-specific titles, prices, and images, and apply changes to multiple products at once.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
