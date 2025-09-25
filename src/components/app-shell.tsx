

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
import { ShoppingCart, ListTodo, ShieldCheck, Users, Package, LineChart, ChevronDown, ChevronRight, List, Database, Settings, Menu, Shirt, UserSearch, Upload, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';
import type { AppSettings } from '@/lib/types';


const DefaultLogo = ({ className }: { className?: string }) => (
    <svg
      className={cn('text-foreground', className)}
      width="160"
      height="32"
      viewBox="0 0 160 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M39.6 29.8C29.7 29.8 21.8 22 21.8 12.2C21.8 2.4 29.7 -5.4 39.6 -5.4C49.5 -5.4 57.4 2.4 57.4 12.2C57.4 22 49.5 29.8 39.6 29.8ZM39.6 -1.9C31.9 -1.9 25.4 4.5 25.4 12.2C25.4 19.9 31.9 26.3 39.6 26.3C47.3 26.3 53.8 19.9 53.8 12.2C53.8 4.5 47.3 -1.9 39.6 -1.9Z"
        fill="currentColor"
      />
      <path
        d="M27.2 18.5V4.6H33.1C36.1 4.6 38.5 5.3 40.3 6.7C42.1 8.1 43 10 43 12.3C43 14.6 42.1 16.5 40.3 17.9C38.5 19.3 36.1 20 33.1 20H29.3V18.5H27.2ZM29.3 18H33.1C35.1 18 36.7 17.5 37.9 16.5C39.1 15.5 39.7 14.1 39.7 12.3C39.7 10.5 39.1 9.1 37.9 8.1C36.7 7.1 35.1 6.6 33.1 6.6H29.3V18Z"
        fill="currentColor"
      />
      <path
        d="M51.6 18.5V4.6H57.6C60.6 4.6 63 5.5 64.8 7.3C66.6 9.1 67.5 11.2 67.5 13.6C67.5 15 67.2 16.2 66.6 17.2C66 18.2 65.2 19 64.2 19.6L68.8 24.6H66.9L62.7 19.8H59V18.5H51.6ZM53.7 16.9H57.8C59.9 16.9 61.5 16.3 62.7 15.1C63.9 13.9 64.5 12.4 64.5 10.6C64.5 8.8 63.9 7.3 62.7 6.1C61.5 4.9 59.9 4.3 57.8 4.3H53.7V16.9Z"
        transform="translate(-25.5, 0)"
        fill="currentColor"
      />
      <text
        x="60"
        y="22"
        fontFamily="Arial, sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="currentColor"
      >
        Capel Rugs
      </text>
    </svg>
);


export function AppShell({ children, settings }: { children: React.ReactNode, settings: AppSettings | null }) {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const [isAmazonOpen, setIsAmazonOpen] = useState(false);
  
  const Logo = () => {
    if (settings?.logoUrl) {
      return <Image src={settings.logoUrl} alt="Logo" width={128} height={32} className="h-8 w-auto" unoptimized />;
    }
    return <DefaultLogo className="w-auto h-7" />;
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
           <div className="flex items-center gap-2 p-2">
            <Logo />
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
                isActive={pathname.startsWith('/bulk-operations')}
                tooltip={{ children: 'Bulk Operations' }}
              >
                <Link href="/bulk-operations">
                  <Upload className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Bulk Operations</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/products')}
                tooltip={{ children: 'Products' }}
              >
                <Link href="/products">
                  <Shirt className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Products</span>
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
                isActive={pathname.startsWith('/customers')}
                tooltip={{ children: 'Customers' }}
              >
                <Link href="/customers">
                  <UserSearch className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-200">Customers</span>
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
          <div className="p-3 text-center text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              <p>This ERP System is Developed by Rakshit Vaish with <Heart className="inline h-3 w-3 text-red-500" fill="currentColor" /></p>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <header className="md:hidden flex items-center justify-between gap-2 p-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <Logo />
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
