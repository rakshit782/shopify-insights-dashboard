
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { ShoppingCart, ListTodo, ShieldCheck, Users, Package, LineChart, ChevronDown, ChevronRight, List, Database, Settings, Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
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
                isActive={pathname.startsWith('/product-database')}
                tooltip={{ children: 'Product Database' }}
              >
                <Link href="/product-database">
                  <Database className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Product Database</span>
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
                isActive={pathname === '/settings'}
                tooltip={{ children: 'Settings' }}
              >
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <header className="md:hidden flex items-center justify-between gap-2 p-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h1 className="font-headline text-lg font-bold tracking-tight text-foreground">
                    Shopify Insights
                </h1>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
               <Menu className="h-6 w-6" />
               <span className="sr-only">Toggle Menu</span>
            </Button>
         </header>
        {children}
      </SidebarInset>
    </>
  );
}
