

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
import { ShoppingCart, ListTodo, ShieldCheck, Users, Package, LineChart, ChevronDown, ChevronRight, List, Database, Settings, Menu, Shirt, UserSearch, Upload } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';


const Logo = ({ className }: { className?: string }) => (
    <svg
      className={cn('text-foreground', className)}
      width="160"
      height="32"
      viewBox="0 0 460 80"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0)">
        <path
          d="M89.15 31.95c0-10.3 3.6-18.4 10.8-24.3 7.2-5.85 16.9-8.75 29.1-8.75 12.25 0 21.9 2.9 29.1 8.75 7.15 5.9 10.75 14 10.75 24.3 0 10.35-3.6 18.45-10.75 24.35-7.2 5.9-16.85 8.8-29.1 8.8-12.2 0-21.9-2.9-29.1-8.8-7.2-5.9-10.8-14-10.8-24.35zm12.3 0c0 7.4 2.45 13.25 7.4 17.55 4.9 4.3 11.5 6.5 19.8 6.5 8.25 0 14.85-2.2 19.8-6.5 4.9-4.3 7.4-10.15 7.4-17.55 0-7.45-2.5-13.3-7.4-17.6-4.95-4.3-11.55-6.45-19.8-6.45-8.3 0-14.9 2.15-19.8 6.45-4.95 4.3-7.4 10.15-7.4 17.6z"
        ></path>
        <path
          d="M174.6 37.55c.5-1.8.75-3.8.75-6 0-7.4-2.5-13.25-7.45-17.55-4.9-4.3-11.5-6.5-19.75-6.5-8.3 0-14.9 2.15-19.8 6.45-4.95 4.3-7.4 10.15-7.4 17.6 0 10.3 3.6 18.4 10.8 24.3 7.2 5.85 16.9 8.75 29.1 8.75 8.5 0 15.7-1.7 21.6-5.1l-3.3-9.5c-4.9 2.6-10.3 3.9-16.2 3.9-6.3 0-11.5-1.5-15.6-4.4-4.1-3-6.1-7.15-6.1-12.5h33.4zM242.4 8.85h12.3V65h-12.3V8.85zM292.1 32c0-9.8 3.5-17.55 10.4-23.25 7-5.7 16.4-8.5 28.3-8.5 11.9 0 21.3 2.85 28.3 8.5 6.9 5.7 10.4 13.45 10.4 23.25 0 9.8-3.5 17.5-10.4 23.2-7 5.7-16.4 8.5-28.3 8.5-11.9 0-21.3-2.8-28.3-8.5-6.9-5.7-10.4-13.4-10.4-23.2zm12.3.05c0 7.05 2.4 12.65 7.1 16.85 4.8 4.2 11.1 6.3 19 6.3s14.2-2.1 19-6.3c4.7-4.2 7.1-9.8 7.1-16.85s-2.4-12.6-7.1-16.8c-4.8-4.2-11.1-6.3-19-6.3s-14.2 2.1-19 6.3c-4.7 4.2-7.1 9.75-7.1 16.8z"
        ></path>
        <path d="M259.95 8.85h12.3V65h-12.3V8.85z"></path>
        <path
          d="M371.35 65h-13.2L344.2 37.1h-.25v27.9h-11.3V8.85h13.1l13.75 27.25h.25V8.85h11.25V65z"
        ></path>
        <path d="M39.6 69.4c-21.6 0-39.6-17.9-39.6-39.6S18 10.2 39.6 10.2s39.6 17.9 39.6 39.6-17.9 29.6-39.6 29.6zm0-75.7C19.9 3.5 3.5 19.9 3.5 39.6s16.4 36.1 36.1 36.1 36.1-16.4 36.1-36.1S59.3 3.5 39.6 3.5z"></path>
        <path
          d="M39.6 57.2c-9.9 0-18-8.1-18-18s8.1-18 18-18 18 8.1 18 18-8.1 18-18 18zm0-32.5c-8 0-14.5 6.5-14.5 14.5s6.5 14.5 14.5 14.5 14.5-6.5 14.5-14.5-6.5-14.5-14.5-14.5zM27.2 45.4h-2.1V27.3h10.9c4.35 0 7.45 1.1 9.3 3.3 1.85 2.2 2.8 5.1 2.8 8.7 0 3.9-1.05 6.95-3.15 9.15-2.1 2.2-5.3 3.3-9.55 3.3h-8.2v-6.3zm2.1-8.3h5.9c2.9 0 5-.6 6.3-1.8 1.3-1.2 2-2.9 2-5.1 0-2.2-.7-3.9-2-5.1-1.3-1.2-3.3-1.8-6-1.8h-6.2v13.8z"
        ></path>
        <path d="M51.6 45.4h-2.1V27.3h10.8c4.6 0 8 .9 10.2 2.7s3.3 4.5 3.3 8.1c0 2.5-.5 4.6-1.5 6.3s-2.6 3-4.8 3.9l7.7 7.1h-2.8l-7.2-6.8h-3.6v6.8zm2.1-8.7h6.2c3.2 0 5.6-.8 7.2-2.4 1.6-1.6 2.4-3.7 2.4-6.3 0-2.3-.7-4.2-2-5.6-1.3-1.4-3.3-2.1-5.9-2.1h-7.9v16.4z"></path>
      </g>
      <defs>
        <clipPath id="clip0">
          <path fill="#fff" d="M0 0h460v79.1H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );

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
            <Logo className="w-auto h-7" />
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
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <header className="md:hidden flex items-center justify-between gap-2 p-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <Logo className="w-auto h-7" />
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
