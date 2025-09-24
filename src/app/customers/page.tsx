
import { CustomersDashboard } from '@/components/customers-dashboard';

export default function CustomersPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers</h1>
                <p className="text-muted-foreground">
                    A unified list of all your customers across every channel.
                </p>
            </div>
            <CustomersDashboard />
        </div>
    );
}
