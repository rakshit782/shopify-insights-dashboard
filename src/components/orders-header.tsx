
'use client';

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { addDays, format, subDays } from "date-fns";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";

interface OrdersHeaderProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    dateRange?: DateRange;
    onDateRangeChange: (range?: DateRange) => void;
}

export function OrdersHeader({
    searchQuery,
    onSearchQueryChange,
    dateRange,
    onDateRangeChange,
}: OrdersHeaderProps) {
    
    const handlePresetChange = (value: string) => {
        const now = new Date();
        switch (value) {
            case 'today':
                onDateRangeChange({ from: now, to: now });
                break;
            case 'yesterday':
                const yesterday = subDays(now, 1);
                onDateRangeChange({ from: yesterday, to: yesterday });
                break;
            case 'last7':
                onDateRangeChange({ from: subDays(now, 6), to: now });
                break;
            case 'last30':
                onDateRangeChange({ from: subDays(now, 29), to: now });
                break;
            case 'all':
            default:
                onDateRangeChange(undefined);
                break;
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-auto md:flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Order ID or Customer..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                 <Select onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="last7">Last 7 Days</SelectItem>
                        <SelectItem value="last30">Last 30 Days</SelectItem>
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full md:w-[300px] justify-start text-left font-normal",
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
                                <span>Pick a date</span>
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
            </div>
        </div>
    );
}
