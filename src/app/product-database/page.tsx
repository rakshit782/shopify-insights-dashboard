
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

export default function ProductDatabasePage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Product Database</h1>
                <p className="text-muted-foreground">
                    View and manage all product data synced from your channels.
                </p>
            </div>

            <Card className="min-h-[60vh]">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section will house your unified product database.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                    <Database className="h-16 w-16 mb-4" />
                    <p className="text-lg font-semibold">The product database is being built.</p>
                    <p className="mt-2 max-w-md">
                        You'll soon be able to search, filter, and view all product information that has been synced to your local database.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
