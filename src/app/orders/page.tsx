
import { MultiPlatformOrdersDashboard } from '@/components/multi-platform-orders-dashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function OrdersPage() {
    const supabaseUrl = process.env.SUPABASE_URL_MAIN;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN;

    if (!supabaseUrl || !supabaseKey) {
        return (
          <div className="flex h-screen items-center justify-center p-8">
            <Alert variant="destructive" className="max-w-2xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Your Supabase credentials are not configured correctly. Please add `SUPABASE_URL_MAIN` and `SUPABASE_SERVICE_ROLE_KEY_MAIN` to your `.env` file and restart the server to view orders.
              </AlertDescription>
            </Alert>
          </div>
        );
    }
    
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
