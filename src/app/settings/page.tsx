
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from './_components/settings-form';
import { getSupabaseCredentials } from './actions';

export default async function SettingsPage() {
    const creds = await getSupabaseCredentials();

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground/80 mb-6">
            Settings
            </h2>
            <Card>
                <CardHeader>
                    <CardTitle>Supabase Credentials</CardTitle>
                    <CardDescription>
                        Enter your Supabase project URL and anon key to connect to your database.
                        These credentials will be stored securely in a cookie and are only used on the server.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsForm 
                        defaultValues={{
                            supabaseUrl: creds.supabaseUrl?.includes('YOUR_SUPABASE_URL') ? '' : creds.supabaseUrl,
                            supabaseKey: creds.supabaseKey?.includes('YOUR_SUPABASE_ANON_KEY') ? '' : creds.supabaseKey,
                        }}
                    />
                </CardContent>
            </Card>
        </main>
    );
}
