
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function CompetitorsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Competitor Analysis</h1>
                <p className="text-muted-foreground">
                    Track and analyze your competitor's products and pricing.
                </p>
            </div>

            <Card className="min-h-[60vh]">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section will house the competitor analysis and tracking tools.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                    <Users className="h-16 w-16 mb-4" />
                    <p className="text-lg font-semibold">Competitor tracking is on the way.</p>
                    <p className="mt-2 max-w-md">
                        You'll soon be able to add competitor products, track their pricing changes, and compare their listings against your own.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
