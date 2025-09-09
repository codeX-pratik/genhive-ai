"use client";
import { ReactNode } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

interface PremiumProtectProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function PremiumProtect({ children, fallback }: PremiumProtectProps) {
  return (
    <>
      <SignedOut>
        {fallback || (
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-base font-semibold mb-1">Sign in required</h3>
            <p className="text-sm text-muted-foreground">Please sign in to access this feature.</p>
          </div>
        )}
      </SignedOut>
      <SignedIn>
        {children}
      </SignedIn>
    </>
  );
}


