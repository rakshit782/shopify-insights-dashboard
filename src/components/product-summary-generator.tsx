'use client';

import { useState } from 'react';
import { Sparkles, Loader2, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateSummary } from '@/app/actions';
import type { ShopifyProduct } from '@/lib/types';
import { Badge } from './ui/badge';

interface ProductSummaryGeneratorProps {
  product: ShopifyProduct;
}

export function ProductSummaryGenerator({ product }: ProductSummaryGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onGenerate = async () => {
    setIsLoading(true);
    setError(null);

    const input = {
      productName: product.title,
      productDescription: product.description,
      averageRating: product.averageRating,
      numberOfReviews: product.numberOfReviews,
      unitsSold: product.unitsSold,
      totalRevenue: product.totalRevenue,
    };

    const result = await handleGenerateSummary(input);

    if (result.error) {
      setError(result.error);
      toast({
        title: 'Error Generating Summary',
        description: result.error,
        variant: 'destructive',
      });
    } else if (result.summary) {
      setSummary(result.summary);
    }
    setIsLoading(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!summary && !error) {
      onGenerate();
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="w-full">
        <Sparkles className="mr-2 h-4 w-4" />
        AI Summary
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Generated Summary
            </DialogTitle>
            <DialogDescription>
              An AI-powered summary of "{product.title}" based on key metrics.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 min-h-[120px] rounded-lg border bg-muted/50 p-4">
            {isLoading && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Generating summary...</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-destructive">
                <ServerCrash className="h-8 w-8" />
                <p className="font-semibold">Generation Failed</p>
                <p className="text-center text-sm">{error}</p>
              </div>
            )}
            {!isLoading && summary && (
              <p className="text-sm leading-relaxed text-foreground">{summary}</p>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Badge variant="outline">Powered by Genkit</Badge>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
