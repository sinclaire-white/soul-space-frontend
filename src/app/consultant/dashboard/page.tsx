"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { availabilitiesApi, bookingsApi, consultantsApi } from "@/lib/api";
import { useAuth, useIsConsultant } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock3, ShieldCheck, Users } from "lucide-react";

export default function ConsultantDashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const isConsultant = useIsConsultant();

  const { data: profile } = useQuery({
    queryKey: ["consultant", "me"],
    queryFn: () => consultantsApi.getMyProfile(),
    select: (res) => res.data.data,
    enabled: isAuthenticated && isConsultant,
  });

  const { data: bookings } = useQuery({
    queryKey: ["consultant-bookings"],
    queryFn: () => bookingsApi.getConsultantBookings({ page: 1, limit: 6 }),
    select: (res) => res.data.data,
    enabled: isAuthenticated && isConsultant,
  });

  const { data: availabilities } = useQuery({
    queryKey: ["availabilities", "me"],
    queryFn: () => availabilitiesApi.getMine(),
    select: (res) => res.data.data,
    enabled: isAuthenticated && isConsultant,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-muted/30" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Consultant Dashboard</h1>
        <p className="mt-3 text-muted-foreground">Sign in with a consultant account to manage sessions and availability.</p>
        <Link href="/auth/signin">
          <Button className="mt-6">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (!isConsultant) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Consultant access only</h1>
        <p className="mt-3 text-muted-foreground">Apply first to become a consultant and unlock this dashboard after admin approval.</p>
        <Link href="/consultant/apply">
          <Button className="mt-6">Apply to Become a Consultant</Button>
        </Link>
      </div>
    );
  }

  const activeAvailabilities = Array.isArray(availabilities)
    ? availabilities.filter((item: any) => !item.isBlocked).length
    : 0;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 animate-fade-in">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold">Consultant Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Review verification status, upcoming sessions, and current availability.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="animate-slide-up stagger-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5" />Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{profile?.verificationStatus || "PENDING"}</Badge>
            <p className="mt-3 text-sm text-muted-foreground">{profile?.professionalTitle || "Consultant profile pending setup"}</p>
          </CardContent>
        </Card>
        <Card className="animate-slide-up stagger-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5" />Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{bookings?.total || 0}</p>
            <p className="mt-2 text-sm text-muted-foreground">Total bookings assigned to you.</p>
          </CardContent>
        </Card>
        <Card className="animate-slide-up stagger-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Clock3 className="h-5 w-5" />Available Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{activeAvailabilities}</p>
            <p className="mt-2 text-sm text-muted-foreground">Unblocked availability entries currently open.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="animate-slide-up stagger-4">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Recent client bookings for your practice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookings?.bookings?.length ? (
              bookings.bookings.map((booking: any) => (
                <div key={booking.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{booking.client?.name || booking.client?.nickname?.handle || "Client"}</p>
                      <p className="text-sm text-muted-foreground">{new Date(booking.scheduledAt).toLocaleString()}</p>
                    </div>
                    <Badge>{booking.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No consultant bookings found yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-slide-up stagger-5">
          <CardHeader>
            <CardTitle>Profile Snapshot</CardTitle>
            <CardDescription>Key fields from your consultant profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Hourly rate</span>
              <span className="font-medium">${profile?.hourlyRate || 0}/hr</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Experience</span>
              <span className="font-medium">{profile?.yearsExperience || 0} years</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sessions</span>
              <span className="font-medium">{profile?.totalSessions || 0}</span>
            </div>
            <div className="pt-2">
              <p className="mb-2 text-muted-foreground">Specializations</p>
              <div className="flex flex-wrap gap-2">
                {profile?.specializations?.length ? (
                  profile.specializations.map((specialization: string) => (
                    <Badge key={specialization} variant="outline">{specialization}</Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No specializations listed yet.</span>
                )}
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="mt-4 w-full">
                <Users className="mr-2 h-4 w-4" />
                View Account Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}