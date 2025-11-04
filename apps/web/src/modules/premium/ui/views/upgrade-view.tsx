"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { PricingCard } from "../components/pricing-card";
import { trpc } from "@/utils/trpc";
import { LoadingState } from "@/components/custom/loading-state";
import { ErrorState } from "@/components/custom/error-state";

export const UpgradeView = () => {
  const { data: products } = useSuspenseQuery(trpc.premium.getProducts.queryOptions());
  const { data: currentSubscription } = useSuspenseQuery(trpc.premium.getCurrentSubscription.queryOptions());

  return (
    <div className="flex flex-1 flex-col gap-y-10 px-4 py-4 md:px-8">
      <div className="mt-4 flex flex-1 flex-col items-center gap-y-10">
        <h5 className="font-medium text-2xl md:text-3xl">
          You are on the{" "}
          <span className="font-semibold text-primary">
            {currentSubscription?.name ?? "Free"}
          </span>{" "}
          plan
        </h5>

        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
          {products.map((product) => {
            const isCurrent = currentSubscription?.id === product.id;
            const hasSubscription = Boolean(currentSubscription);

            const buttonText = isCurrent
              ? "Manage"
              : hasSubscription
              ? "Change Plan"
              : "Upgrade";

            const onClick = isCurrent || hasSubscription
              ? () => authClient.customer.portal()
              : () => authClient.checkout({ products: [product.id] });

            const firstPrice = product.prices?.[0];
            const price =
              firstPrice?.amountType === "fixed"
                ? (firstPrice.priceAmount ?? 0) / 100
                : 0;

            return (
              <PricingCard
                key={product.id}
                title={product.name}
                description={product.description}
                variant={product.metadata?.variant === "highlighted" ? "highlighted" : "default"}
                price={price}
                priceSuffix={
                  firstPrice?.recurringInterval
                    ? `/${firstPrice.recurringInterval}`
                    : ""
                }
                features={product.benefits?.map((b) => b.description) ?? []}
                badge={product.metadata?.badge ?? null}
                buttonText={buttonText}
                onClick={onClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const UpgradeViewLoading = () => (
  <LoadingState title="Loading" description="This may take a few seconds" />
);

export const UpgradeViewError = () => (
  <ErrorState title="Error" description="Please try again later" />
);
