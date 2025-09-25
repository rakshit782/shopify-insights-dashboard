
import { PricingManagerDashboard } from '@/components/pricing-manager-dashboard';

export default function PricingManagerPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Pricing Manager</h1>
                <p className="text-muted-foreground">
                    View and update product prices in bulk across all your sales channels.
                </p>
            </div>
            <PricingManagerDashboard />
        </div>
    );
}
