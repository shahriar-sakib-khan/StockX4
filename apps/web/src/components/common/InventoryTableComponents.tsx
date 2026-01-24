import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import React from "react";

// Wrapper
export const InventoryTableWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("border rounded-xl bg-card overflow-hidden shadow-sm", className)}>
        <Table>{children}</Table>
    </div>
);

// Header
export const InventoryTableHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <TableHeader className={cn("bg-muted/40", className)}>
        <TableRow className="h-9 hover:bg-muted/40">
            {children}
        </TableRow>
    </TableHeader>
);

export const InventoryHeadCell = ({ children, className, align = 'left', width }: { children?: React.ReactNode, className?: string, align?: 'left' | 'center' | 'right', width?: string }) => (
    <TableHead className={cn("h-9 px-2 text-base font-bold text-muted-foreground", align === 'center' && "text-center", align === 'right' && "text-right", width, className)}>
        {children}
    </TableHead>
);

// Row
export const InventoryRow = ({ children, className, ...props }: React.ComponentProps<typeof TableRow>) => (
    <TableRow className={cn("hover:bg-muted/50", className)} {...props}>
        {children}
    </TableRow>
);

// Cells
export const InventoryCell = ({ children, className, align = 'left' }: { children?: React.ReactNode, className?: string, align?: 'left' | 'center' | 'right' }) => (
    <TableCell className={cn("py-2 px-2 text-base align-middle", align === 'center' && "text-center", align === 'right' && "text-right", className)}>
        {children}
    </TableCell>
);

// Count Cell (Big Numbers)
export const InventoryCountCell = ({ count, type = 'normal', className, children }: { count: number, type?: 'normal' | 'muted' | 'destructive', className?: string, children?: React.ReactNode }) => {
    let textColor = "";
    if (type === 'muted') textColor = "text-muted-foreground";
    if (type === 'destructive') textColor = "text-destructive";

    return (
        <InventoryCell align="center" className={className}>
             <div className="flex items-center justify-center gap-1">
                <span className={cn("text-3xl font-bold", textColor)}>
                    {count}
                </span>
                {children}
             </div>
        </InventoryCell>
    );
};

// Price Cell (Mono)
export const InventoryPriceCell = ({ price, className }: { price: number, className?: string }) => (
    <InventoryCell align="right" className={cn("font-mono font-medium", className)}>
        ৳{price}
    </InventoryCell>
);

// Badge
export const InventoryBadge = ({ children, variant = 'blue', className }: { children: React.ReactNode, variant?: 'blue' | 'orange' | 'default', className?: string }) => {
    const variants = {
        blue: "bg-blue-100 text-blue-700",
        orange: "bg-orange-100 text-orange-700",
        default: "bg-muted text-muted-foreground"
    };

    return (
        <span className={cn("px-2 py-1 rounded text-xs font-mono font-bold whitespace-nowrap", variants[variant], className)}>
            {children}
        </span>
    );
};
