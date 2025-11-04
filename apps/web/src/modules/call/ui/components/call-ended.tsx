import Link from "next/link";

import { Button } from "@/components/ui/button";

export const CallEnded = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-radial from-sidebar-accent to-sidebar">
      <div className="flex flex-1 items-center justify-center px-8 py-4">
        <div className="flex flex-col items-center justify-center gap-y-6 rounded-lg bg-background p-10 shadow-sm">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="font-medium text-lg">You have ended the call</h6>
            <p className="text-sm">Summary will appear in a few minutes.</p>
          </div>
          <Button asChild>
            <Link href="/meetings">Back to meetings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
