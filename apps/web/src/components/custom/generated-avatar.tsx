import { createAvatar } from "@dicebear/core";
import { botttsNeutral, initials } from "@dicebear/collection";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AvatarVariant } from "../constant.component";

interface GeneratedAvatarProps {
  seed: string;
  className?: string;
  variant: AvatarVariant
}

export const GeneratedAvatar = ({
  seed,
  className,
  variant
}: GeneratedAvatarProps) => {
  const safeSeed = seed?.trim() || "user";

  const avatar =
    variant === "botttsNeutral"
      ? createAvatar(botttsNeutral, { seed: safeSeed })
      : createAvatar(initials, {
          seed: safeSeed,
          fontWeight: 500,
          fontSize: 42,
        });

  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={avatar.toDataUri()} alt="Avatar" />
      <AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
