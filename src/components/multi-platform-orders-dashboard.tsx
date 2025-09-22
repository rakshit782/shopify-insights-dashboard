
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersDashboard } from './orders-dashboard';
import { Package, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

const platforms = [
  {
    name: 'Shopify',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    name: 'Amazon',
    icon: <Image src="/amazon.svg" alt="Amazon" width={20} height={20} />,
  },
  {
    name: 'Walmart',
    icon: <Image src="/walmart.svg" alt="Walmart" width={20} height={20} />,
  },
  {
    name: 'eBay',
    icon: <Image src="/ebay.svg" alt="eBay" width={20} height={20} />,
  },
  {
    name: 'Etsy',
    icon: <Image src="/etsy.svg" alt="Etsy" width={20} height={20} />,
  },
  {
    name: 'Wayfair',
    icon: <Image src="/wayfair.svg" alt="Wayfair" width={20} height={20} />,
  },
];

export function MultiPlatformOrdersDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage your orders across all connected marketplaces.</p>
      </div>

      <Tabs defaultValue="Shopify" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {platforms.map(platform => (
            <TabsTrigger key={platform.name} value={platform.name} className="gap-2">
              {platform.icon}
              {platform.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {platforms.map(platform => (
          <TabsContent key={platform.name} value={platform.name} className="pt-6">
            <OrdersDashboard platform={platform.name as any} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
