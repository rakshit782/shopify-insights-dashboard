"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { handleSyncProducts } from "@/app/actions";

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const onSync = async () => {
    setIsSyncing(true);
    const result = await handleSyncProducts();

    if (result.success) {
      toast({
        title: "Sync Successful",
        description: `${result.count} products have been synced to your website database.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Sync Failed",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsSyncing(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={onSync} disabled={isSyncing}>
      {isSyncing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      Sync to Website
    </Button>
  );
}
