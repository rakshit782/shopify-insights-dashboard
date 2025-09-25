
import { ProductCreationForm } from '@/components/product-creation-form';
import { ProductSearchAndEdit } from '@/components/product-search-edit';
import { AiOptimizer } from '@/components/ai-optimizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CatalogingManagerPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Cataloging Manager</h1>
                <p className="text-muted-foreground">
                    Create, manage, and optimize your master product catalog from a single place.
                </p>
            </div>
            <Tabs defaultValue="create">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="create">Create New Product</TabsTrigger>
                    <TabsTrigger value="edit">Search & Edit</TabsTrigger>
                    <TabsTrigger value="optimize">AI Optimizer</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                    <ProductCreationForm />
                </TabsContent>
                <TabsContent value="edit">
                    <ProductSearchAndEdit />
                </TabsContent>
                 <TabsContent value="optimize">
                    <AiOptimizer />
                </TabsContent>
            </Tabs>
        </div>
    );
}
