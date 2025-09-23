
import { ProductCreationForm } from '@/components/product-creation-form';

export default function CatalogingManagerPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Cataloging Manager</h1>
                <p className="text-muted-foreground">
                    Create and manage your master product catalog from a single place.
                </p>
            </div>
            <ProductCreationForm />
        </div>
    );
}
