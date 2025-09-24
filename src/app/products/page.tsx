
import { MultiPlatformProductsDashboard } from '@/components/multi-platform-products-dashboard';

export default function ProductsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
                <p className="text-muted-foreground">
                    A unified view of all your product listings across every channel.
                </p>
            </div>
            <MultiPlatformProductsDashboard />
        </div>
    );
}
