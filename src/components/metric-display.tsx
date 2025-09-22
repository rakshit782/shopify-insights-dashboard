import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricDisplayProps {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}

export function MetricDisplay({
  icon: Icon,
  label,
  value,
  className,
}: MetricDisplayProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-1" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-sm font-semibold text-foreground', className)}>
          {value}
        </p>
      </div>
    </div>
  );
}
