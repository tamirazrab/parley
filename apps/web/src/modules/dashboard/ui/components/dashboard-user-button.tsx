"use client";

import { useRouter } from "next/navigation";
import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { GeneratedAvatar } from "@/components/custom/generated-avatar";

export const DashboardUserButton = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { data, isPending } = authClient.useSession();

  const user = data?.user;

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/sign-in"),
      },
    });
  };

  const handleBilling = () => authClient.customer.portal();

  if (isPending || !user) return null;

  const UserAvatar = (
    <>
      {user.image ? (
        <Avatar>
          <AvatarImage src={user.image} alt={user.name} />
        </Avatar>
      ) : (
        <GeneratedAvatar seed={user.name} variant="initials" className="size-9 mr-3" />
      )}
    </>
  );

  const UserInfo = (
    <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
      <p className="text-sm truncate">{user.name}</p>
      <p className="text-xs truncate text-muted-foreground">{user.email}</p>
    </div>
  );

  const TriggerBaseClasses =
    "rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2";

  // --- Mobile View ---
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger className={TriggerBaseClasses}>
          {UserAvatar}
          {UserInfo}
          <ChevronDownIcon className="size-4 shrink-0" />
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{user.name}</DrawerTitle>
            <DrawerDescription>{user.email}</DrawerDescription>
          </DrawerHeader>

          <DrawerFooter>
            <Button variant="outline" onClick={handleBilling}>
              <CreditCardIcon className="size-4" />
              Billing
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOutIcon className="size-4" />
              Logout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // --- Desktop View ---
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={TriggerBaseClasses}>
        {UserAvatar}
        {UserInfo}
        <ChevronDownIcon className="size-4 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="right" className="w-72">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium truncate">{user.name}</span>
            <span className="text-sm text-muted-foreground truncate">{user.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleBilling}
          className="cursor-pointer flex items-center justify-between"
        >
          Billing
          <CreditCardIcon className="size-4" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer flex items-center justify-between"
        >
          Logout
          <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
