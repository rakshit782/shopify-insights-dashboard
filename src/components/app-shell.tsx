
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
import { ShoppingCart, ListTodo, ShieldCheck, Users, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // In a real app, this would come from a context or a server fetch
  const businessLogo = null; // Placeholder

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
                isActive={pathname.startsWith('/listing-manager')}
                tooltip={{ children: 'Listing Manager' }}
              >
                <Link href="/listing-manager">
                  <ListTodo className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Listing Manager</span>
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
