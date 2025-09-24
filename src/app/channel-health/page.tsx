
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { ChannelHealthDashboard } from '@/components/channel-health-dashboard';

export default async function ChannelHealthPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl === "your-supabase-main-url") {
        return (
          <div className="flex h-screen items-center justify-center p-8">
            <Alert variant="destructive" className="max-w-2xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Your Supabase credentials for the main database are not configured correctly. Please add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the `.env` file in the root of the project and ensure your server is restarted.
              </AlertDescription>
            </Alert>
          </div>
        );
    }

    return <ChannelHealthDashboard />;
}
