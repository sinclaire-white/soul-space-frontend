"use client";

import { useQuery } from "@tanstack/react-query";
import { postsApi, bookingsApi } from "@/lib/api";
import { useAuth, useIsConsultant } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, MessageSquare, User, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const isConsultant = useIsConsultant();

  const { data: myPosts } = useQuery({
    queryKey: ["my-posts"],
    queryFn: () => postsApi.getMyPosts({ page: 1, limit: 5 }),
    select: (res) => ({
      posts: Array.isArray(res.data.data) ? res.data.data : [],
      total: res.data.meta?.total ?? 0,
    }),
    enabled: isAuthenticated,
  });

  const { data: myBookings } = useQuery({
    queryKey: ["my-bookings", isConsultant ? "consultant" : "user"],
    queryFn: () =>
      isConsultant
        ? bookingsApi.getConsultantBookings({ page: 1, limit: 5 })
        : bookingsApi.getAll({ page: 1, limit: 5 }),
    select: (res) => res.data.data,
    enabled: isAuthenticated,
  });

  const stats = [
    {
      title: "My Posts",
      value: myPosts?.total || 0,
      icon: FileText,
      href: "/feed",
    },
    {
      title: "Comments",
      value: 0,
      icon: MessageSquare,
      href: "/feed",
    },
    {
      title: "Bookings",
      value: myBookings?.total || 0,
      icon: Calendar,
      href: isConsultant ? "/consultant/dashboard" : "/consultants",
    },
    {
      title: "Sessions",
      value: myBookings?.bookings?.filter((b: any) => b.status === "COMPLETED").length || 0,
      icon: Clock,
      href: isConsultant ? "/consultant/dashboard" : "/dashboard",
    },
  ];

  if (isAuthLoading) {
    return <div className="min-h-screen bg-muted/30" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <h1 className="text-3xl font-bold">Sign in to view your dashboard</h1>
        <p className="mt-3 text-muted-foreground">
          Your dashboard shows your posts, bookings, and account activity.
        </p>
        <Link href="/auth/signin">
          <Button className="mt-6">Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-slide-up stagger-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="posts" className="animate-slide-up stagger-3">
              <TabsList>
                <TabsTrigger value="posts">Recent Posts</TabsTrigger>
                <TabsTrigger value="bookings">Upcoming Bookings</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4">
                {myPosts?.posts?.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No posts yet</p>
                      <Link href="/feed">
                        <Button className="mt-4">Create Your First Post</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  myPosts?.posts?.map((post: any) => (
                    <Card key={post.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-medium line-clamp-1">
                            {post.content.slice(0, 100)}...
                          </CardTitle>
                          <Badge variant={post.status === "ACTIVE" ? "default" : "secondary"}>
                            {post.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                {myBookings?.bookings?.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No bookings yet</p>
                      <Link href="/consultants">
                        <Button className="mt-4">Find a Consultant</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  myBookings?.bookings?.map((booking: any) => (
                    <Card key={booking.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {isConsultant
                                ? `Session with ${booking.client?.name || booking.client?.nickname?.handle || "Client"}`
                                : `Session with ${booking.consultant?.user?.name || "Consultant"}`}
                            </CardTitle>
                            <CardDescription>
                              {new Date(booking.scheduledAt).toLocaleString()}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              booking.status === "CONFIRMED"
                                ? "default"
                                : booking.status === "PENDING"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/feed">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </Link>
                <Link href="/consultants">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Session
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                </Link>
                {!isConsultant && (
                  <Link href="/consultant/apply">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Become a Consultant
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {isConsultant && (
              <Card>
                <CardHeader>
                  <CardTitle>Consultant Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/consultant/dashboard">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Manage Availability
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
  );
}
