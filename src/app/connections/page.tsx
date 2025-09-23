
import { ConnectionsForm } from '@/components/connections-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import 'dotenv/config';

export default async function ConnectionsPage() {
    const supabaseUrl = process.env.SUPABASE_URL_MAIN;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN;

    if (!supabaseUrl || !supabaseKey) {
        return (
          <div className="flex h-screen items-center justify-center p-8">
            <Alert variant="destructive" className="max-w-2xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Your Supabase credentials are not configured correctly. Please add your `SUPABASE_URL_MAIN` and `SUPABASE_SERVICE_ROLE_KEY_MAIN` to the `.env` file in the root of the project and ensure your server is restarted.
              </Aler
tDescription>
            </Alert>
          </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                 <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Connections</h1>
                    <p className="text-muted-foreground">
                        Manage your connections to external marketplaces and services.
                    </p>
                </div>
                <ConnectionsForm />
            </div>
        </div>
    );
}
