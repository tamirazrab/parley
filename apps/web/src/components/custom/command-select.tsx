"use client";

import { ReactNode, useMemo, useState, useCallback } from "react";
import { ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from "@/components/ui/command";

interface CommandOption {
  id: string;
  value: string;
  children: ReactNode;
}

interface CommandSelectProps {
  options: CommandOption[];
  onSelect: (value: string) => void;
  onSearch?: (query: string) => void;
  value: string;
  placeholder?: string;
  isSearchable?: boolean;
  className?: string;
}

export const CommandSelect = ({
  options,
  onSelect,
  onSearch,
  value,
  placeholder = "Select an option",
  isSearchable = true,
  className,
}: CommandSelectProps) => {
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const handleDialogToggle = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) onSearch?.(""); 
      setOpen(nextOpen);
    },
    [onSearch]
  );

  const handleSelect = useCallback(
    (val: string) => {
      onSelect(val);
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "h-9 w-full justify-between px-2 font-normal transition-colors",
          !selectedOption && "text-muted-foreground",
          className
        )}
      >
        <div className="truncate">
          {selectedOption?.children ?? placeholder}
        </div>
        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-70" />
      </Button>

      <CommandResponsiveDialog
        shouldFilter={!onSearch}
        open={open}
        onOpenChange={handleDialogToggle}
      >
        {isSearchable && (
          <CommandInput
            placeholder="Search..."
            onValueChange={(val) => onSearch?.(val.trim())}
          />
        )}

        <CommandList>
          <CommandEmpty>
            <span className="text-sm text-muted-foreground">
              No options found
            </span>
          </CommandEmpty>

          {options.map((option) => (
            <CommandItem
              key={option.id}
              onSelect={() => handleSelect(option.value)}
              className={cn(
                "cursor-pointer transition-colors",
                option.value === value && "bg-muted/50"
              )}
            >
              {option.children}
            </CommandItem>
          ))}
        </CommandList>
      </CommandResponsiveDialog>
    </>
  );
};
