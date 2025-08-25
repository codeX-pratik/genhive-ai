"use client";

import { ReactNode, useState } from "react";
import { ThemeToggle } from "@/components/Landingpage/ThemeToggle";
import Logo from "@/components/Landingpage/Logo";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Landingpage/Sidebar";

export default function AiLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="w-full h-14 border-b flex items-center justify-between px-4 sm:px-6 bg-card dark:bg-gray-900 sticky top-0 z-50">
        <div className="flex items-center">
          <Logo />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Desktop - Fixed position */}
        <div className="hidden md:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-40">
          <Sidebar />
        </div>

        {/* Sidebar Mobile - Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Sidebar Drawer */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-64 bg-card shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              }`}
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              <Sidebar
                isMobile
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
              />
            </div>
          </div>
        )}

        {/* Main Content - Add left margin to account for sidebar */}
        <main className="flex-1 p-4 md:p-6 md:ml-64 transition-all duration-300 overflow-y-auto min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
