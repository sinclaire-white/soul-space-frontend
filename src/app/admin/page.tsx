"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  ShieldCheck,
  BookOpen,
  FileWarning,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();

  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => adminApi.getDashboardStats(),
    select: (res) => res.data.data,
    enabled: isAuthenticated && isAdmin,
  });

  const { data: dailyStats } = useQuery({
    queryKey: ["admin-daily-stats"],
    queryFn: () => adminApi.getDailyStats(30),
    select: (res) => res.data.data as { date: string; newUsers: number; newPosts: number }[],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: pendingApplications } = useQuery({
    queryKey: ["admin-pending-consultants"],
    queryFn: () => adminApi.getConsultantApplications({ page: 1, limit: 5, status: "PENDING" }),
    select: (res) => res.data.data,
    enabled: isAuthenticated && isAdmin,
  });

  const { data: recentReports } = useQuery({
    queryKey: ["admin-reports-recent"],
    queryFn: () => adminApi.getReports({ page: 1, limit: 5 }),
    select: (res) => res.data.data,
    enabled: isAuthenticated && isAdmin,
  });

  if (isLoading) return <div className="min-h-[60vh] bg-muted/30 animate-pulse rounded-lg" />;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Admin Panel</h1>
        <p className="text-muted-foreground mb-6">Sign in with an admin account to continue.</p>
        <Link href="/auth/signin"><Button>Sign In</Button></Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Access Denied</h1>
        <p className="text-muted-foreground mb-6">This panel is for administrators only.</p>
        <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    );
  }

  const navCards = [
    {
      href: "/admin/users",
      label: "Users",
      description: "View, suspend, or deactivate user accounts",
      icon: Users,
      count: stats?.totalUsers,
    },
    {
      href: "/admin/posts",
      label: "Posts",
      description: "Review and delete community posts",
      icon: FileText,
      count: stats?.totalPosts,
    },
    {
      href: "/admin/consultants",
      label: "Consultants",
      description: "Verify or manage consultant profiles",
      icon: ShieldCheck,
      count: stats?.totalConsultants,
    },
    {
      href: "/admin/consultant-applications",
      label: "Applications",
      description: "Review pending consultant applications",
      icon: BookOpen,
      badge: pendingApplications?.length ? `${pendingApplications.length} pending` : undefined,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="mt-1 text-muted-foreground">Manage users, content, and consultant applications.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{stats?.totalUsers ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Consultants</p>
                <p className="text-3xl font-bold">{stats?.totalConsultants ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-3xl font-bold">{stats?.totalPosts ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {navCards.map(({ href, label, description, icon: Icon, count, badge }) => (
          <Link key={href} href={href}>
            <Card className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {label}
                  </div>
                  <div className="flex items-center gap-2">
                    {badge && (
                      <Badge variant="secondary" className="text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
                        {badge}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
                {count !== undefined && (
                  <p className="mt-2 text-2xl font-bold">{count}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Bar charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              New Users — Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyStats ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyStats} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                    tick={{ fontSize: 11 }}
                    interval={4}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    formatter={(value: number) => [value, "New Users"]}
                  />
                  <Bar dataKey="newUsers" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-50 animate-pulse rounded-lg bg-muted/30" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              New Posts — Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyStats ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyStats} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                    tick={{ fontSize: 11 }}
                    interval={4}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    formatter={(value: number) => [value, "New Posts"]}
                  />
                  <Bar dataKey="newPosts" fill="hsl(var(--chart-2, 160 60% 45%))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-50 animate-pulse rounded-lg bg-muted/30" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      {(recentReports?.reports?.length ?? 0) > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <FileWarning className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Recent Reports</h2>
          </div>
          <div className="space-y-2">
            {recentReports.reports.slice(0, 5).map((report: any) => (
              <div key={report.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{report.reportType}</p>
                  <p className="text-xs text-muted-foreground">{report.notes || "No notes"}</p>
                </div>
                <Badge variant={report.status === "PENDING" ? "secondary" : "outline"}>
                  {report.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending applications quick list */}
      {(pendingApplications?.length ?? 0) > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold">Awaiting Review</h2>
          </div>
          <div className="space-y-2">
            {pendingApplications.slice(0, 3).map((app: any) => (
              <div key={app.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{app.fullName}</p>
                  <p className="text-xs text-muted-foreground">{app.email}</p>
                </div>
                <Badge variant="secondary" className="text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
                  Pending
                </Badge>
              </div>
            ))}
            <Link href="/admin/consultant-applications">
              <Button variant="outline" size="sm" className="w-full mt-1">View all applications</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
