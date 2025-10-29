import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

type AvatarVariant = "botttsNeutral" | "initials";

interface GenerateAvatarProps {
  seed: string;
  variant: AvatarVariant;
}

const avatarConfigs: Record<AvatarVariant, Parameters<typeof createAvatar>[0]> = {
  botttsNeutral,
  initials,
};

export function generateAvatarUri({ seed, variant }: GenerateAvatarProps): string {
  const style = avatarConfigs[variant];

  const options =
    variant === "initials"
      ? { seed, fontWeight: 500, fontSize: 42 }
      : { seed };

  return createAvatar(style, options).toDataUri();
}
