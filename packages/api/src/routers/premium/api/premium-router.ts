import { polarClient } from './../../../../../auth/src/lib/payments';
import { eq, count } from "drizzle-orm";
import { protectedProcedure, router } from "../../..";
import { meetings } from '@parley/db/schema/meeting';
import { agents } from '@parley/db/schema/agent';
import { db } from '@parley/db';

export const premiumRouter = router({
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    try {
      const customer = await polarClient.customers.getStateExternal({
        externalId: ctx.session.user.id,
      });

      const subscription = customer.activeSubscriptions[0];
      if (!subscription) return null;

      const product = await polarClient.products.get({
        id: subscription.productId,
      });

      return product
    } catch {
      return null;
    }
  }),

  getProducts: protectedProcedure.query(async () => {
    try {
      const { result } = await polarClient.products.list({
        isArchived: false,
        isRecurring: true,
        sorting: ["price_amount"],
      });

      return result
    } catch {
      return [];
    }
  }),

  getFreeUsage: protectedProcedure.query(async ({ ctx }) => {
    try {
      const customer = await polarClient.customers.getStateExternal({
        externalId: ctx.session.user.id,
      });

      const subscription = customer.activeSubscriptions[0];
      if (subscription) return null;

      const [meetingResult, agentResult] = await Promise.all([
        db
          .select({ count: count(meetings.id) })
          .from(meetings)
          .where(eq(meetings.userId, ctx.session.user.id)),
        db
          .select({ count: count(agents.id) })
          .from(agents)
          .where(eq(agents.userId, ctx.session.user.id)),
      ]);

      const meetingCount = meetingResult?.[0]?.count ?? 0;
      const agentCount = agentResult?.[0]?.count ?? 0;

      return { meetingCount, agentCount };
    } catch {
      return { meetingCount: 0, agentCount: 0 };
    }
  }),
});
