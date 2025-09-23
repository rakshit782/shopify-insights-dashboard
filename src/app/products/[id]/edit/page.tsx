
import { Suspense } from 'react';
import { handleGetProduct } from '@/app/actions';
import { EditProductForm } from '@/components/edit-product-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function EditProductSkeleton() {
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-40 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-24 w-full" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex justify-end pt-4">
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardContent>
        </Card>
    )
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const productId = Number(params.id);

  if (isNaN(productId)) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Invalid Product ID</AlertTitle>
                <AlertDescription>
                The product ID in the URL is not a valid number.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  const { product, error } = await handleGetProduct(productId);
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <div className="max-w-4xl mx-auto mb-6">
         <Button asChild variant="outline" size="sm">
            <Link href="/cataloging-manager">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cataloging Manager
            </Link>
         </Button>
       </div>
      <Suspense fallback={<EditProductSkeleton />}>
        {error && (
            <Alert variant="destructive" className="max-w-4xl mx-auto">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Product</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {product && <EditProductForm product={product} />}
      </Suspense>
    </div>
  );
}
