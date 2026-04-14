"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import type { Route } from "next";

const STATIC_NAV_LINKS = [
  { href: "/", label: "Map" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/dashboard", label: "Civic Dashboard" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/export", label: "Export" },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = [
    ...STATIC_NAV_LINKS,
    ...(session?.user ? [{ href: `/profile/${session.user.name}`, label: "Profile" }] : []),
  ];

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#171717] border-b border-[#2a2a2a] flex items-center px-4 sm:px-6 gap-4 sm:gap-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image src="/logo.png" alt="P(l)otHole" width={120} height={32} className="h-8 w-auto" priority />
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href as Route}
                className={`
                  px-3 py-1 text-sm font-medium rounded-md transition-colors duration-150
                  relative after:absolute after:bottom-0 after:left-3 after:right-3
                  after:h-0.5 after:rounded-full after:transition-all after:duration-150
                  ${
                    isActive
                      ? "text-white after:bg-[#F99300]"
                      : "text-[#9ca3af] hover:text-white after:bg-transparent"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto md:ml-0">
          {status === "loading" ? (
            <div className="hidden sm:block h-8 w-20 bg-[#2a2a2a] rounded-full animate-pulse" />
          ) : session?.user ? (
            <div className="hidden md:flex items-center gap-3">
              {session.user.isModerator && (
                <Link
                  href="/admin"
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors
                    ${pathname.startsWith("/admin")
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "text-purple-400/70 hover:text-purple-400 border border-transparent hover:border-purple-500/30"}`}
                >
                  Admin
                </Link>
              )}
              <span className="hidden lg:inline text-sm text-[#9ca3af]">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-1.5 text-sm font-medium text-[#f5f5f5]
                         border border-[#444] rounded-full hover:border-[#888] transition-colors duration-150"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="hidden md:inline-flex px-4 py-1.5 text-sm font-medium text-[#f5f5f5]
                         border border-[#444] rounded-full hover:border-[#888] transition-colors duration-150"
            >
              Log in
            </Link>
          )}
          <Link
            href="/report/new"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-sm font-semibold
                       text-white bg-[#F99300] rounded-full hover:bg-[#e07e00]
                       transition-colors duration-150"
          >
            <span>+</span>
            <span className="hidden sm:inline">Report hazard</span>
            <span className="sm:hidden">Report</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#444] text-[#f5f5f5] hover:border-[#888] transition-colors duration-150"
          >
            <span className="text-lg leading-none">{isMobileMenuOpen ? "x" : "\u2630"}</span>
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 md:hidden border-b border-[#2a2a2a] bg-[#171717]/95 backdrop-blur-sm shadow-lg">
          <nav id="mobile-nav" className="px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={`mobile-${link.href}`}
                  href={link.href as Route}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActive
                      ? "bg-[#F99300]/15 text-white"
                      : "text-[#9ca3af] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {session?.user?.isModerator && (
              <Link
                href="/admin"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  pathname.startsWith("/admin")
                    ? "bg-purple-500/20 text-purple-400"
                    : "text-purple-400/80 hover:bg-purple-500/10"
                }`}
              >
                Admin
              </Link>
            )}

            <div className="mt-2 pt-3 border-t border-[#2a2a2a]">
              {status === "loading" ? (
                <div className="h-9 w-24 bg-[#2a2a2a] rounded-full animate-pulse" />
              ) : session?.user ? (
                <div className="flex flex-col gap-3">
                  <span className="text-sm text-[#9ca3af]">{session.user.name}</span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="self-start px-4 py-1.5 text-sm font-medium text-[#f5f5f5]
                               border border-[#444] rounded-full hover:border-[#888] transition-colors duration-150"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="inline-flex px-4 py-1.5 text-sm font-medium text-[#f5f5f5]
                             border border-[#444] rounded-full hover:border-[#888] transition-colors duration-150"
                >
                  Log in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
