"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useIsConsultant, useIsAdmin } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  User,
  Clock,
  ShieldCheck,
  BookOpen,
  Heart,
} from "lucide-react";

const userNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/my-posts", label: "My Posts", icon: FileText },
  { href: "/consultants", label: "Find Consultants", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

const consultantExtraItems = [
  { href: "/consultant/dashboard", label: "Consultant Tools", icon: Clock },
];

const adminNavItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/consultants", label: "Consultants", icon: ShieldCheck },
  { href: "/admin/consultant-applications", label: "Applications", icon: BookOpen },
];

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

function NavItem({ href, label, icon: Icon, exact }: NavItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function DashboardSidebar() {
  const isConsultant = useIsConsultant();

  const items = isConsultant
    ? [...userNavItems, ...consultantExtraItems]
    : userNavItems;

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col gap-1 py-6 pr-4">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Dashboard
      </p>
      {items.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
      <div className="mt-6 px-3">
        <Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Heart className="h-3 w-3" />
          Back to Soul Space
        </Link>
      </div>
    </aside>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col gap-1 py-6 pr-4">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Admin Panel
      </p>
      {adminNavItems.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
      <div className="mt-6 px-3">
        <Link href="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <LayoutDashboard className="h-3 w-3" />
          User Dashboard
        </Link>
      </div>
    </aside>
  );
}
