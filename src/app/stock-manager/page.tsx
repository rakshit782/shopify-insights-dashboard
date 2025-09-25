
import { StockManagerDashboard } from '@/components/stock-manager-dashboard';

export default function StockManagerPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Stock Manager</h1>
                <p className="text-muted-foreground">
                    View and update product inventory in bulk across all your sales channels.
                </p>
            </div>
            <StockManagerDashboard />
        </div>
    );
}
