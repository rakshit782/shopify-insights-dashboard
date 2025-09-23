
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function OrdersPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
                <p className="text-muted-foreground">
                    A unified view of all your orders across every channel.
                </p>
            </div>

            <Card className="min-h-[60vh]">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section will house the unified order and fulfillment hub.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                    <Package className="h-16 w-16 mb-4" />
                    <p className="text-lg font-semibold">The unified order inbox is on its way.</p>
                    <p className="mt-2 max-w-md">
                        You'll soon be able to manage orders, purchase shipping labels, and handle fulfillment from a single dashboard.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
