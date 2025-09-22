
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
import { BarChartHorizontal, Globe, Settings, ShoppingCart } from 'lucide-react';
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
              <Image src={businessLogo} alt="Business Logo" width={24} height={24} className="h-6 w-6 object-contain" />
            ) : (
              <ShoppingCart className="h-6 w-6 text-primary" />
            )}
            <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
              Shopify Insights
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/'}
                tooltip={{ children: 'Analytics' }}
              >
                <Link href="/">
                  <BarChartHorizontal />
                  <span>Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/shopify-products'}
                tooltip={{ children: 'Shopify Products' }}
              >
                <Link href="/shopify-products">
                  <ShoppingCart />
                  <span>Shopify Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/website-products'}
                tooltip={{ children: 'Website Products' }}
              >
                <Link href="/website-products">
                  <Globe />
                  <span>Website Products</span>
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
                isActive={pathname === '/connections'}
                tooltip={{ children: 'Connections' }}
              >
                <Link href="/connections">
                  <Settings />
                  <span>Connections</span>
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
