
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersDashboard } from './orders-dashboard';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import type { DateRange } from 'react-day-picker';
import { OrdersHeader } from './orders-header';
import type { ShopifyOrder } from '@/lib/types';
import { subDays, startOfDay, endOfDay } from 'date-fns';

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

const getInitialDateRange = (): DateRange => {
    const now = new Date();
    return {
        from: startOfDay(subDays(now, 13)),
        to: endOfDay(now),
    };
};

export function MultiPlatformOrdersDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getInitialDateRange());
  const [activeTab, setActiveTab] = useState('Shopify');
  const [filteredOrdersByTab, setFilteredOrdersByTab] = useState<Record<string, ShopifyOrder[]>>({});

  const handleFilteredOrdersChange = useCallback((platform: string, orders: ShopifyOrder[]) => {
    setFilteredOrdersByTab(prev => ({ ...prev, [platform]: orders }));
  }, [setFilteredOrdersByTab]);

  const handleDateRangeChange = useCallback((range?: DateRange) => {
    setDateRange(range);
  }, [setDateRange]);

  const currentFilteredOrders = useMemo(() => {
    return filteredOrdersByTab[activeTab] || [];
  }, [activeTab, filteredOrdersByTab]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage your orders across all connected marketplaces.</p>
      </div>
      
      <OrdersHeader
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        filteredOrders={currentFilteredOrders}
      />

      <Tabs defaultValue="Shopify" className="w-full mt-6" onValueChange={setActiveTab}>
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
            <OrdersDashboard 
              platform={platform.name as any}
              searchQuery={searchQuery}
              dateRange={dateRange}
              onFilteredOrdersChange={(orders) => handleFilteredOrdersChange(platform.name, orders)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
