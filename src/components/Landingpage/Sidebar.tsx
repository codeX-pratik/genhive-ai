"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useUser, useClerk, Protect } from "@clerk/nextjs";
import Image from "next/image";
import { sidebarlinks } from "@/lib/asset";

interface SidebarProps {
  isMobile?: boolean;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({
  isMobile = false,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const wrapperClass = isMobile
    ? cn(
        "fixed inset-y-0 left-0 w-64 md:hidden border-r bg-white dark:bg-gray-900 flex flex-col z-50 shadow-lg transform transition-transform duration-300 ease-in-out h-screen",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )
    : "w-64 border-r bg-white dark:bg-gray-900 hidden md:flex flex-col fixed left-0 top-14 h-[calc(100vh-3.5rem)]";

  return (
    <div className={wrapperClass}>
      {/* User Profile Section */}
      <div className="p-4 border-b flex items-center gap-3 bg-gray-100 dark:bg-gray-800">
        {isLoaded ? (
          <>
            {user?.imageUrl && (
              <Image
                src={user.imageUrl}
                alt="Profile"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            {(user?.username || user?.primaryEmailAddress?.emailAddress) && (
              <div className="flex flex-col">
                {user?.username && (
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {user.username}
                  </span>
                )}
                {user?.primaryEmailAddress?.emailAddress && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {user.primaryEmailAddress.emailAddress}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          // Loading skeleton
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="flex flex-col gap-1 flex-1">
              <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-2 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Links - Scrollable Section */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {sidebarlinks.map((link) => {
          const IconComponent = link.Icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => isMobile && setMobileOpen?.(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-gray-300 dark:bg-gray-700 font-semibold text-gray-900 dark:text-gray-100"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
              )}
            >
              <IconComponent className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Profile & Sign Out - Fixed at bottom */}
      {isLoaded && user && (
        <div className="w-full border-t p-4 flex items-center justify-between bg-gray-100 dark:bg-gray-800 mt-auto">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => openUserProfile()}
          >
            {user.imageUrl && (
              <Image
                src={user.imageUrl}
                alt="Profile"
                width={30}
                height={30}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="flex flex-col">
              {user.username && (
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.username}
                </span>
              )}
              <Protect
                plan="premium"
                fallback={
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Free
                  </span>
                }
              >
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Premium
                </span>
              </Protect>
            </div>
          </div>

          <LogOut
            onClick={() => signOut()}
            className="w-6 h-6 text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 cursor-pointer transition-colors"
          />
        </div>
      )}
    </div>
  );
}
