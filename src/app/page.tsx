
'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/shopify-mock-data';
import type { ShopifyProduct } from '@/lib/types';
import { ProductTable } from '@/components/product-table';

export default function Home() {
  const productData: ShopifyProduct[] = products;
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader 
        products={productData}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground/80 mb-6">
          Product Overview
        </h2>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productData.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <ProductTable products={productData} />
        )}
      </main>
    </div>
  );
}
