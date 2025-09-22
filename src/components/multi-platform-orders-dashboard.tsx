'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersDashboard } from './orders-dashboard';
import { ShoppingCart, Terminal } from 'lucide-react';
import Image from 'next/image';
import type { DateRange } from 'react-day-picker';
import { OrdersHeader } from './orders-header';
import type { ShopifyOrder } from '@/lib/types';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { handleGetCredentialStatuses } from '@/app/actions';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const platforms = [
  {
    name: 'Shopify',
    id: 'shopify',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    name: 'Amazon',
    id: 'amazon',
    icon: <Image src="/amazon.svg" alt="Amazon" width={20} height={20} unoptimized />,
  },
  {
    name: 'Walmart',
    id: 'walmart',
    icon: <Image src="/walmart.svg" alt="Walmart" width={20} height={20} unoptimized />,
  },
  {
    name: 'eBay',
    id: 'ebay',
    icon: <Image src="/ebay.svg" alt="eBay" width={20} height={20} unoptimized />,
  },
  {
    name: 'Etsy',
    id: 'etsy',
    icon: <Image src="/etsy.svg" alt="Etsy" width={20} height={20} unoptimized />,
  },
  {
    name: 'Wayfair',
    id: 'wayfair',
    icon: <Image src="/wayfair.svg" alt="Wayfair" width={20} height={20} unoptimized />,
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
  
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, boolean>>({});
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatuses() {
      setIsLoadingStatus(true);
      setStatusError(null);
      const result = await handleGetCredentialStatuses();
      if (result.success && result.statuses) {
        setConnectionStatuses(result.statuses);
      } else {
        setStatusError(result.error || 'Could not load connection statuses.');
      }
      setIsLoadingStatus(false);
    }
    fetchStatuses();
  }, []);

  const handleFilteredOrdersChange = useCallback((platform: string, orders: ShopifyOrder[]) => {
    setFilteredOrdersByTab(prev => ({ ...prev, [platform]: orders }));
  }, [setFilteredOrdersByTab]);

  const handleDateRangeChange = useCallback((range?: DateRange) => {
    setDateRange(range);
  }, [setDateRange]);

  const currentFilteredOrders = useMemo(() => {
    return filteredOrdersByTab[activeTab] || [];
  }, [activeTab, filteredOrdersByTab]);
  
  const renderTabsContent = () => {
    if (isLoadingStatus) {
        return <Skeleton className="h-64 w-full mt-6" />;
    }
    if (statusError) {
        return (
            <Alert variant="destructive" className="mt-6">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Connections</AlertTitle>
                <AlertDescription>{statusError}</AlertDescription>
            </Alert>
        )
    }

    return platforms.map(platform => (
      <TabsContent key={platform.name} value={platform.name} className="pt-6">
        <OrdersDashboard 
          platform={platform.name as any}
          isConnected={connectionStatuses[platform.id] || false}
          searchQuery={searchQuery}
          dateRange={dateRange}
          onFilteredOrdersChange={handleFilteredOrdersChange}
        />
      </TabsContent>
    ));
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
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

        {renderTabsContent()}
        
      </Tabs>
    </div>
  );
}
