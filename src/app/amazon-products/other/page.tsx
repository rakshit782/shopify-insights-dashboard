
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function AmazonOtherProductsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Amazon Products (Other)</h1>
                <p className="text-muted-foreground">
                    Manage your Amazon products for other marketplaces.
                </p>
            </div>

            <Card className="min-h-[60vh]">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section will house your Amazon products for other regions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                    <Image src="/amazon.svg" alt="Amazon" width={64} height={64} className="h-16 w-16 mb-4" />
                    <p className="text-lg font-semibold">Amazon product management for other regions is on the way.</p>
                </CardContent>
            </Card>
        </div>
    );
}
