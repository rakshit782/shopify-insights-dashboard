
import { BulkOperationsDashboard } from '@/components/bulk-operations-dashboard';

export default function BulkOperationsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Bulk Operations</h1>
                <p className="text-muted-foreground">
                    Upload and manage your product listings in bulk across different marketplaces.
                </p>
            </div>
            <BulkOperationsDashboard />
        </div>
    );
}
