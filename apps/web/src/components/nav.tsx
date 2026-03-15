"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Map" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/dashboard", label: "Civic dashboard" },
  { href: "/export", label: "Export" },
  { href: "/profile/me", label: "Profile" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#171717] border-b border-[#2a2a2a] flex items-center px-6 gap-8">
      {/* Logo */}
      <Link
        href="/"
        className="flex-shrink-0 font-bold text-xl tracking-tight leading-none"
      >
        <span className="text-white">P</span>
        <span className="text-[#e5521e]">(l)ot</span>
        <span className="text-white">Hole</span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                px-3 py-1 text-sm font-medium rounded-md transition-colors duration-150
                relative after:absolute after:bottom-0 after:left-3 after:right-3
                after:h-0.5 after:rounded-full after:transition-all after:duration-150
                ${
                  isActive
                    ? "text-white after:bg-[#e5521e]"
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
      <div className="flex items-center gap-3 flex-shrink-0 ml-auto md:ml-0">
        <Link
          href="/auth"
          className="hidden sm:inline-flex px-4 py-1.5 text-sm font-medium text-[#f5f5f5]
                     border border-[#444] rounded-full hover:border-[#888] transition-colors duration-150"
        >
          Log in
        </Link>
        <Link
          href="/report/new"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold
                     text-white bg-[#e5521e] rounded-full hover:bg-[#cc4418]
                     transition-colors duration-150"
        >
          <span>+</span>
          <span>Report hazard</span>
        </Link>
      </div>
    </header>
  );
}
