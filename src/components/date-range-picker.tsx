
'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { addDays, format, subDays } from 'date-fns';
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
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });
  const [preset, setPreset] = React.useState<string>('7');

  React.useEffect(() => {
    onUpdate(date);
  }, [date, onUpdate]);

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const now = new Date();
    switch (value) {
        case '1': setDate({ from: now, to: now }); break;
        case '2': setDate({ from: subDays(now, 1), to: subDays(now, 1) }); break;
        case '7': setDate({ from: subDays(now, 6), to: now }); break;
        case '30': setDate({ from: subDays(now, 29), to: now }); break;
        case 'month': setDate({ from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }); break;
        case 'year': setDate({ from: new Date(now.getFullYear(), 0, 1), to: now }); break;
        default: setDate(undefined);
    }
  }

  const handleDateChange = (newDate: DateRange | undefined) => {
      setDate(newDate);
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
