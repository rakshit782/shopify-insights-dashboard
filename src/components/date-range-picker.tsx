
'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    onUpdate: (range?: DateRange) => void;
}

export function DateRangePicker({ className, onUpdate }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [preset, setPreset] = React.useState<string>('7');

  React.useEffect(() => {
    // Set initial date on client-side to avoid hydration mismatch
    if (date === undefined) {
        const initialDate = {
            from: subDays(new Date(), 6),
            to: new Date(),
        };
        setDate(initialDate);
        onUpdate(initialDate);
    }
  // We only want this to run once on mount, so we pass an empty dependency array.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = (range?: DateRange) => {
    setDate(range);
    onUpdate(range);
  }

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const now = new Date();
    let newRange: DateRange | undefined;
    switch (value) {
        case '1': newRange = { from: now, to: now }; break;
        case '2': newRange = { from: subDays(now, 1), to: subDays(now, 1) }; break;
        case '7': newRange = { from: subDays(now, 6), to: now }; break;
        case '30': newRange = { from: subDays(now, 29), to: now }; break;
        case 'month': newRange = { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }; break;
        case 'year': newRange = { from: new Date(now.getFullYear(), 0, 1), to: now }; break;
        default: newRange = undefined;
    }
    handleUpdate(newRange);
  }

  const handleDateChange = (newDate: DateRange | undefined) => {
      handleUpdate(newDate);
      if (newDate) {
          // A custom date range was selected, so clear the preset
          setPreset('custom');
      }
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <div className="flex items-center gap-2">
        <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="1">Today</SelectItem>
                <SelectItem value="2">Yesterday</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="custom" disabled>Custom Range</SelectItem>
            </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-[300px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} -{' '}
                    {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
