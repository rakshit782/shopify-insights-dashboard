
'use client'

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppShell } from '@/components/app-shell';
import { ThemeProvider } from '@/components/theme-provider';
import { usePathname } from 'next/navigation';

// No metadata export from a client component

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <title>Shopify Insights</title>
        <meta name="description" content="A dashboard to show product data from Shopify." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {isAuthPage ? (
            <main>{children}</main>
          ) : (
            <SidebarProvider>
              <AppShell>
                {children}
              </AppShell>
            </SidebarProvider>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
