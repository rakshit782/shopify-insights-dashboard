
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store } from 'lucide-react';

export default function ShopifyProductsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Shopify Products</h1>
                <p className="text-muted-foreground">
                    Manage your Shopify products.
                </p>
            </div>

            <Card className="min-h-[60vh]">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section will house your Shopify products.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                    <Store className="h-16 w-16 mb-4" />
                    <p className="text-lg font-semibold">Shopify product management is on the way.</p>
                </CardContent>
            </Card>
        </div>
    );
}
