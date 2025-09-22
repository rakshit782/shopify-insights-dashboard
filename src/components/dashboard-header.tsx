import { LayoutGrid, List, RefreshCw } from 'lucide-react';
import type { ShopifyProduct } from '@/lib/types';
import { ExportButton } from './export-button';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SyncButton } from './sync-button';

interface DashboardHeaderProps {
  products: ShopifyProduct[];
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onRefresh: () => void;
}

export function DashboardHeader({ products, viewMode, onViewModeChange, onRefresh }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
      </div>
      <div className="ml-auto flex items-center gap-2">
        <TooltipProvider>
           <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={'ghost'}
                size="icon"
                onClick={onRefresh}
                className="h-8 w-8"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh Data</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('grid')}
                className="h-8 w-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grid View</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('table')}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Table View</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <SyncButton />
        <ExportButton products={products} />
      </div>
    </header>
  );
}
