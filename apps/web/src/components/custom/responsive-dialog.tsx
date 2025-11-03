"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface ResponsiveDialogProps {
  /** Dialog title displayed at the top */
  title: string;
  /** Short description displayed below the title */
  description?: string;
  /** Dialog or drawer content */
  children: React.ReactNode;
  /** Controls open state */
  open: boolean;
  /** Handles open/close changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * A responsive dialog that automatically switches between
 * a modal (desktop) and bottom drawer (mobile) presentation.
 *
 * Keeps UX consistent across device types while reusing the same API.
 */
export const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
  title,
  description,
  children,
  open,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();

  // Render as mobile drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <div className="p-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Render as desktop dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
