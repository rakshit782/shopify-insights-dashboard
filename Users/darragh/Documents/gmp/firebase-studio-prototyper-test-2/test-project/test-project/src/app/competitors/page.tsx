
import { Suspense } from 'react';
import { CompetitorsDashboard } from '@/components/competitors-dashboard';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import 'dotenv/config';

export default async function CompetitorsPage() {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!sheetId || !apiKey) {
        return (
          <div className="flex h-screen items-center justify-center p-8">
            <Alert variant="destructive" className="max-w-2xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Your Google Sheets credentials are not configured correctly. Please add `GOOGLE_SHEET_ID` and `GOOGLE_SHEETS_API_KEY` to your `.env` file and restart the server.
              </AlertDescription>
            </Alert>
          </div>
        );
    }
    
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <CompetitorsDashboard />
        </Suspense>
    );
}
