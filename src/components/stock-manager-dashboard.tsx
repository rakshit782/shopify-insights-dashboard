
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Boxes } from 'lucide-react';

export function StockManagerDashboard() {
    return (
        <Card className="min-h-[60vh]">
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                    This section will house the bulk stock management tools.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                <Boxes className="h-16 w-16 mb-4" />
                <p className="text-lg font-semibold">Bulk Stock Management is on the way.</p>
                <p className="mt-2 max-w-md">
                    You'll soon be able to view and edit inventory levels for all your products across every marketplace from a single table.
                </p>
            </CardContent>
        </Card>
    );
}
