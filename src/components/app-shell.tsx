

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
      <text
        x="0"
        y="22"
        fontFamily="Arial, sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="currentColor"
      >
        Your Logo Here
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
            <p>
              This ERP System is Developed by{' '}
              <a
                href="https://www.linkedin.com/in/rakshitvaish"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                Rakshit Vaish
              </a>{' '}
              with <Heart className="inline h-3 w-3 text-red-500" fill="currentColor" />
            </p>
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
