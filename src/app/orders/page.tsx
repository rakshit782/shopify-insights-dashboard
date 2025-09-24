
import { MultiPlatformOrdersDashboard } from '@/components/multi-platform-orders-dashboard';

export default function OrdersPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
                <p className="text-muted-foreground">
                    A unified view of all your orders across every channel.
                </p>
            </div>
            <MultiPlatformOrdersDashboard />
        </div>
    );
}
