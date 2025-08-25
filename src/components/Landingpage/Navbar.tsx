"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useClerk, UserButton, useUser } from "@clerk/nextjs";
import Logo from "./Logo";
import { useEffect } from "react";

export default function Navbar() {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // Only reload if user just logged out and hasn't reloaded yet
    if (
      isLoaded &&
      isSignedIn === false &&
      !sessionStorage.getItem("reloadedAfterSignOut")
    ) {
      sessionStorage.setItem("reloadedAfterSignOut", "true");
      window.location.reload();
    }

    // Reset the flag when user logs in
    if (isSignedIn === true) {
      sessionStorage.removeItem("reloadedAfterSignOut");
    }
  }, [isSignedIn, isLoaded]);

  return (
    <div className="fixed z-5 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32">
      <Logo />

      <div className="flex items-center gap-4 sm:gap-5">
        <ThemeToggle />

        {user ? (
          <UserButton />
        ) : (
          <Button
            onClick={() => openSignIn()}
            className="rounded-full cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 hover:from-blue-600 hover:to-purple-600 transition-colors"
          >
            Get started <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
