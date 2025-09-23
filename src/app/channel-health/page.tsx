
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { ChannelHealthDashboard } from '@/components/channel-health-dashboard';

export default async function ChannelHealthPage() {
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
              </AlertDescription>
            </Alert>
          </div>
        );
    }

    return <ChannelHealthDashboard />;
}
