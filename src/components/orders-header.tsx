
'use client';

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { subDays, format, startOfDay, endOfDay, isSameDay } from "date-fns";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { ExportOrdersButton } from "./export-orders-button";
import type { ShopifyOrder } from "@/lib/types";


interface OrdersHeaderProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    dateRange?: DateRange;
    onDateRangeChange: (range?: DateRange) => void;
    filteredOrders: ShopifyOrder[];
}

export function OrdersHeader({
    searchQuery,
    onSearchQueryChange,
    dateRange,
    onDateRangeChange,
    filteredOrders
}: OrdersHeaderProps) {

    const handlePresetChange = (value: string) => {
        const now = new Date();
        switch (value) {
            case 'today':
                onDateRangeChange({ from: startOfDay(now), to: endOfDay(now) });
                break;
            case 'yesterday':
                const yesterday = subDays(now, 1);
                onDateRangeChange({ from: startOfDay(yesterday), to: endOfDay(yesterday) });
                break;
            case 'last7':
                onDateRangeChange({ from: startOfDay(subDays(now, 6)), to: endOfDay(now) });
                break;
            case 'last14':
                 onDateRangeChange({ from: startOfDay(subDays(now, 13)), to: endOfDay(now) });
                break;
            case 'last30':
                onDateRangeChange({ from: startOfDay(subDays(now, 29)), to: endOfDay(now) });
                break;
            default:
                break;
        }
    };

    const selectedPreset = useMemo(() => {
        const now = new Date();
        if (!dateRange || !dateRange.from) return 'custom';
        
        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
    
        if (isSameDay(from, startOfDay(now)) && isSameDay(to, endOfDay(now))) return 'today';
        const yesterday = subDays(now, 1);
        if (isSameDay(from, startOfDay(yesterday)) && isSameDay(to, endOfDay(yesterday))) return 'yesterday';
        if (isSameDay(from, startOfDay(subDays(now, 6))) && isSameDay(to, endOfDay(now))) return 'last7';
        if (isSameDay(from, startOfDay(subDays(now, 13))) && isSameDay(to, endOfDay(now))) return 'last14';
        if (isSameDay(from, startOfDay(subDays(now, 29))) && isSameDay(to, endOfDay(now))) return 'last30';
    
        return 'custom';
    }, [dateRange]);


    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-auto md:flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Order ID, Customer, or Email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                />
            </div>
            <div className="flex w-full flex-col sm:flex-row items-center gap-2 md:w-auto">
                 <Select value={selectedPreset} onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select a date range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="last7">Last 7 Days</SelectItem>
                        <SelectItem value="last14">Last 14 Days</SelectItem>
                        <SelectItem value="last30">Last 30 Days</SelectItem>
                        {selectedPreset === 'custom' && <SelectItem value="custom" disabled>Custom Range</SelectItem>}
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[300px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={onDateRangeChange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                <ExportOrdersButton orders={filteredOrders} />
            </div>
        </div>
    );
}
