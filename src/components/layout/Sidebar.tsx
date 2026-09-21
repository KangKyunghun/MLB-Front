"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "홈", href: "/", icon: "🏠" },
  { label: "경기", href: "/games", icon: "⚾" },
  { label: "순위", href: "/standings", icon: "📊" },
  { label: "선수", href: "/players", icon: "👤" },
  { label: "커뮤니티", href: "/community", icon: "💬" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isLoggedIn, nickname, logout } = useAuthStore();

  return (
    <aside className="sticky top-0 flex h-screen w-[200px] shrink-0 flex-col gap-1 bg-navy px-3.5 py-[18px]">
      <Link
        href="/"
        className="px-2 pb-4 text-[16px] font-medium tracking-[0.3px] text-white"
      >
        ⚾ MLB 커뮤니티
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] transition-colors",
                active
                  ? "bg-accent text-white"
                  : "text-white/65 hover:bg-white/[0.06] hover:text-white",
              ].join(" ")}
            >
              <span className="w-[18px] text-center text-[14px]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="my-2.5 h-px bg-white/10" />

      <div className="mt-auto">
        {isLoggedIn ? (
          <div className="flex flex-col gap-2">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <span className="w-[18px] text-center text-[14px]">👤</span>
              {nickname}
            </Link>
            <button
              onClick={logout}
              className="w-full rounded-lg bg-white/[0.08] py-2.5 text-[13px] text-white transition-colors hover:bg-white/[0.14]"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="block w-full rounded-lg bg-accent py-2.5 text-center text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="block w-full rounded-lg bg-white/[0.08] py-2.5 text-center text-[13px] text-white transition-colors hover:bg-white/[0.14]"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}