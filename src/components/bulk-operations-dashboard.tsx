
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkUploadView } from './bulk-upload-view';
import Image from 'next/image';

const platformMeta: { 
  [key: string]: { 
    name: string; 
    icon: React.ReactNode;
  } 
} = {
    'shopify': { 
        name: 'Shopify', 
        icon: <Image src="/shopify.svg" alt="Shopify" width={18} height={18} unoptimized />,
    },
    'amazon': { 
        name: 'Amazon', 
        icon: <Image src="/amazon.svg" alt="Amazon" width={18} height={18} unoptimized />,
    },
    'walmart': { 
        name: 'Walmart', 
        icon: <Image src="/walmart.svg" alt="Walmart" width={18} height={18} unoptimized />,
    },
};

export function BulkOperationsDashboard() {
    const platforms = ['shopify', 'amazon', 'walmart'];

    return (
        <Tabs defaultValue="shopify" className="w-full">
            <TabsList>
                 {platforms.map(id => (
                    <TabsTrigger key={id} value={id}>
                    <div className="flex items-center gap-2">
                        {platformMeta[id].icon}
                        {platformMeta[id].name}
                    </div>
                    </TabsTrigger>
                ))}
            </TabsList>
            {platforms.map(id => (
                <TabsContent key={id} value={id}>
                    <BulkUploadView platform={platformMeta[id].name} />
                </TabsContent>
            ))}
        </Tabs>
    );
}
