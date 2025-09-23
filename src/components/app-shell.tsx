
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { ShoppingCart, ListTodo, ShieldCheck, Users, Package, LineChart, ChevronDown, ChevronRight, List } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // In a real app, this would come from a context or a server fetch
  const businessLogo = null; // Placeholder
  const [isAmazonOpen, setIsAmazonOpen] = useState(false);

  return (
    <>
      <Sidebar>
        <SidebarHeader>
           <div className="flex items-center gap-2 p-2">
            {businessLogo ? (
              <Image src={businessLogo} alt="Business Logo" width={20} height={20} unoptimized className="h-5 w-5 object-contain" />
            ) : (
              <ShoppingCart className="h-5 w-5 text-primary" />
            )}
            <h1 className="font-headline text-lg font-bold tracking-tight text-foreground">
              Shopify Insights
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/analytics')}
                tooltip={{ children: 'Analytics' }}
              >
                <Link href="/analytics">
                  <LineChart className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/shopify-products')}
                tooltip={{ children: 'Shopify Products' }}
              >
                <Link href="/shopify-products">
                    <Image src="/shopify.svg" alt="Shopify" width={20} height={20} className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Shopify Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <Collapsible open={isAmazonOpen} onOpenChange={setIsAmazonOpen}>
              <SidebarMenuItem>
                 <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        isActive={pathname.startsWith('/amazon-products')}
                        tooltip={{children: 'Amazon Products'}}
                        className="justify-between w-full"
                    >
                        <div className="flex items-center gap-3">
                           <Image src="/amazon.svg" alt="Amazon" width={20} height={20} className="h-5 w-5" />
                           <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Amazon Products</span>
                        </div>
                        <ChevronDown className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[collapsible=icon]:opacity-0",
                            isAmazonOpen && "rotate-180"
                        )} />
                    </SidebarMenuButton>
                 </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenuSub>
                    <SidebarMenuSubItem>
                        <Link href="/amazon-products/us">
                            <SidebarMenuSubButton isActive={pathname === '/amazon-products/us'}>
                                <span>US Marketplace</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                         <Link href="/amazon-products/uk">
                            <SidebarMenuSubButton isActive={pathname === '/amazon-products/uk'}>
                                <span>UK Marketplace</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                         <Link href="/amazon-products/other">
                            <SidebarMenuSubButton isActive={pathname === '/amazon-products/other'}>
                                <span>Other Marketplaces</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>


             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/walmart-products')}
                tooltip={{ children: 'Walmart Products' }}
              >
                <Link href="/walmart-products">
                  <Image src="/walmart.svg" alt="Walmart" width={20} height={20} className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Walmart Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/ebay-products')}
                tooltip={{ children: 'eBay Products' }}
              >
                <Link href="/ebay-products">
                  <Image src="/ebay.svg" alt="eBay" width={20} height={20} className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">eBay Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/etsy-products')}
                tooltip={{ children: 'Etsy Products' }}
              >
                <Link href="/etsy-products">
                  <Image src="/etsy.svg" alt="Etsy" width={20} height={20} className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Etsy Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/cataloging-manager')}
                tooltip={{ children: 'Cataloging Manager' }}
              >
                <Link href="/cataloging-manager">
                  <ListTodo className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Cataloging Manager</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/orders')}
                tooltip={{ children: 'Orders' }}
              >
                <Link href="/orders">
                  <Package className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Orders</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/competitors'}
                tooltip={{ children: 'Competitors' }}
              >
                <Link href="/competitors">
                  <Users className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Competitors</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/channel-health'}
                tooltip={{ children: 'Channel Health' }}
              >
                <Link href="/channel-health">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Channel Health</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <div className="md:hidden flex items-center gap-2 p-4 border-b">
           <SidebarTrigger />
           <h1 className="font-headline text-lg font-bold tracking-tight text-foreground">
              Shopify Insights
            </h1>
         </div>
        {children}
      </SidebarInset>
    </>
  );
}
