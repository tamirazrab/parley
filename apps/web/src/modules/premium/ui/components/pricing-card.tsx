import { CircleCheckIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const pricingCardVariants = cva(
  "w-full rounded-lg border p-6 transition-colors",
  {
    variants: {
      variant: {
        default: "border-neutral-200 bg-white text-black",
        highlighted: "border-transparent bg-gradient-to-br from-[#093C23] to-[#051B16] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const pricingCardIconVariants = cva("size-5 shrink-0", {
  variants: {
    variant: {
      default: "fill-primary text-primary",
      highlighted: "fill-white text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const secondaryTextVariants = cva("text-sm", {
  variants: {
    variant: {
      default: "text-neutral-700",
      highlighted: "text-neutral-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const badgeVariants = cva("rounded-sm p-1 font-medium text-xs", {
  variants: {
    variant: {
      default: "bg-primary/20 text-black",
      highlighted: "bg-[#F5B797] text-black",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface PricingCardProps extends VariantProps<typeof pricingCardVariants> {
  badge?: string | null;
  price: number;
  features: string[];
  title: string;
  description?: string | null;
  priceSuffix: string;
  className?: string;
  buttonText: string;
  onClick: () => void;
}

export const PricingCard = ({
  variant,
  badge,
  price,
  features,
  title,
  description,
  priceSuffix,
  className,
  buttonText,
  onClick,
}: PricingCardProps) => {
  const formattedPrice = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <div className={cn(pricingCardVariants({ variant }), className)}>
      <div className="flex items-end justify-between gap-x-4">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-2">
            <h6 className="font-medium text-xl">{title}</h6>
            {badge && (
              <Badge className={cn(badgeVariants({ variant }))}>
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className={cn(secondaryTextVariants({ variant }), "text-xs")}>
              {description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-end gap-x-0.5">
          <h4 className="font-medium text-3xl">{formattedPrice}</h4>
          <span className={cn(secondaryTextVariants({ variant }))}>
            {priceSuffix}
          </span>
        </div>
      </div>

      <Separator className="my-6 opacity-10" />

      <Button
        className="w-full"
        size="lg"
        variant={variant === "highlighted" ? "default" : "outline"}
        onClick={onClick}
      >
        {buttonText}
      </Button>

      <div className="mt-6 flex flex-col gap-y-3">
        <p className="font-medium uppercase">Features</p>
        <ul
          className={cn(
            "flex flex-col gap-y-2.5",
            secondaryTextVariants({ variant })
          )}
        >
          {features.map((feature, _i) => (
            <li key={feature} className="flex items-center gap-x-2.5">
              <CircleCheckIcon
                className={cn(pricingCardIconVariants({ variant }))}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
