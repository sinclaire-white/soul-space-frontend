"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { availabilitiesApi, bookingsApi, consultantsApi } from "@/lib/api";
import { useAuth, useIsConsultant } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock3, ShieldCheck, Users, Check, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ConsultantDashboardPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const isConsultant = useIsConsultant();
  const queryClient = useQueryClient();

  const [isEditingConsultant, setIsEditingConsultant] = useState(false);
  const [hourlyRateInput, setHourlyRateInput] = useState<number | string>("");
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<string | null>(null);
  const [availabilityEditForm, setAvailabilityEditForm] = useState({
    dayOfWeek: 0,
    startTime: "",
    endTime: "",
    isRecurring: true,
  });

  const { data: profile } = useQuery({
    queryKey: ["consultant", "me"],
    queryFn: () => consultantsApi.getMyProfile(),
    select: (res) => res.data.data,
    enabled: isAuthenticated && isConsultant,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["consultant-bookings"],
    queryFn: () => bookingsApi.getConsultantBookings({ page: 1, limit: 20 }),
    select: (res) => res.data,
    enabled: isAuthenticated && isConsultant,
  });

  const { data: availabilities } = useQuery({
    queryKey: ["availabilities", "me"],
    queryFn: () => availabilitiesApi.getMine(),
    select: (res) => res.data.data,
    enabled: isAuthenticated && isConsultant,
  });

  useEffect(() => {
    if (profile?.hourlyRate !== undefined && !isEditingConsultant) {
      setHourlyRateInput(profile.hourlyRate);
    }
  }, [profile?.hourlyRate, isEditingConsultant]);

  const updateConsultantMutation = useMutation({
    mutationFn: (data: { hourlyRate?: number }) => consultantsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultant", "me"] });
      setIsEditingConsultant(false);
    },
    onError: (err: any) => {
      console.error("Failed to update consultant profile:", err);
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      availabilitiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availabilities", "me"] });
      setEditingAvailabilityId(null);
    },
    onError: (err: any) => {
      console.error("Failed to update availability:", err);
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: string) => availabilitiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availabilities", "me"] });
    },
    onError: (err: any) => {
      console.error("Failed to delete availability:", err);
    },
  });

  const confirmBookingMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.confirm(id),
    onSuccess: () => {
      toast.success("Booking confirmed");
      queryClient.invalidateQueries({ queryKey: ["consultant-bookings"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to confirm booking");
    },
  });

  const declineBookingMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.decline(id),
    onSuccess: () => {
      toast.success("Booking declined");
      queryClient.invalidateQueries({ queryKey: ["consultant-bookings"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to decline booking");
    },
  });

  const completeBookingMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.complete(id),
    onSuccess: () => {
      toast.success("Booking marked as completed");
      queryClient.invalidateQueries({ queryKey: ["consultant-bookings"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to complete booking");
    },
  });

  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ];

  if (isAuthLoading) {
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

  const bookings = bookingsData?.data || [];
  const totalBookings = bookingsData?.meta?.total || 0;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "default";
      case "PENDING": return "secondary";
      case "COMPLETED": return "outline";
      case "CANCELLED": return "destructive";
      default: return "outline";
    }
  };

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
            <p className="text-3xl font-semibold">{totalBookings}</p>
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
            <CardDescription>Manage your client bookings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookingsLoading ? (
              <p className="text-sm text-muted-foreground">Loading bookings...</p>
            ) : bookings.length > 0 ? (
              bookings.map((booking: any) => (
                <div key={booking.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{booking.client?.name || booking.client?.nickname?.handle || "Client"}</p>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(booking.scheduledAt).toLocaleString()} • {booking.durationMinutes} min
                      </p>
                      {booking.preSessionNotes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Note: {booking.preSessionNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {booking.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => confirmBookingMutation.mutate(booking.id)}
                            disabled={confirmBookingMutation.isPending}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => declineBookingMutation.mutate(booking.id)}
                            disabled={declineBookingMutation.isPending}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                      {booking.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => completeBookingMutation.mutate(booking.id)}
                          disabled={completeBookingMutation.isPending}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
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
              <div className="flex items-center gap-2">
                {!isEditingConsultant ? (
                  <>
                    <span className="font-medium">${profile?.hourlyRate || 0}/hr</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setHourlyRateInput(profile?.hourlyRate ?? "");
                        setIsEditingConsultant(true);
                      }}
                    >
                      Edit
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={hourlyRateInput as number | string}
                      onChange={(e) => setHourlyRateInput(e.target.value)}
                      className="w-24 rounded-md border px-2 py-1 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => updateConsultantMutation.mutate({ hourlyRate: Number(hourlyRateInput) })}
                      disabled={updateConsultantMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditingConsultant(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
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
            <div className="pt-4">
              <p className="mb-2 text-muted-foreground">Availability</p>
              {Array.isArray(availabilities) && availabilities.length ? (
                <div className="space-y-2">
                  {availabilities.map((availability: any) => {
                    const isEditing = editingAvailabilityId === availability.id;
                    const currentDate = new Date(availability.startTime).toISOString().slice(0, 10);

                    return (
                      <div key={availability.id} className="rounded-xl border p-3">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-3">
                              <label className="space-y-1 text-sm">
                                <span>Day</span>
                                <select
                                  className="w-full rounded-md border px-3 py-2"
                                  value={availabilityEditForm.dayOfWeek}
                                  onChange={(event) =>
                                    setAvailabilityEditForm((prev) => ({
                                      ...prev,
                                      dayOfWeek: Number(event.target.value),
                                    }))
                                  }
                                >
                                  {daysOfWeek.map((day, index) => (
                                    <option key={day} value={index}>
                                      {day}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="space-y-1 text-sm">
                                <span>Start time</span>
                                <input
                                  type="time"
                                  className="w-full rounded-md border px-3 py-2"
                                  value={availabilityEditForm.startTime}
                                  onChange={(event) =>
                                    setAvailabilityEditForm((prev) => ({
                                      ...prev,
                                      startTime: event.target.value,
                                    }))
                                  }
                                />
                              </label>
                              <label className="space-y-1 text-sm">
                                <span>End time</span>
                                <input
                                  type="time"
                                  className="w-full rounded-md border px-3 py-2"
                                  value={availabilityEditForm.endTime}
                                  onChange={(event) =>
                                    setAvailabilityEditForm((prev) => ({
                                      ...prev,
                                      endTime: event.target.value,
                                    }))
                                  }
                                />
                              </label>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  updateAvailabilityMutation.mutate({
                                    id: availability.id,
                                    data: {
                                      dayOfWeek: availabilityEditForm.dayOfWeek,
                                      startTime: `${currentDate}T${availabilityEditForm.startTime}:00`,
                                      endTime: `${currentDate}T${availabilityEditForm.endTime}:00`,
                                      isRecurring: availabilityEditForm.isRecurring,
                                    },
                                  });
                                }}
                                disabled={updateAvailabilityMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingAvailabilityId(null);
                                  setAvailabilityEditForm({
                                    dayOfWeek: 0,
                                    startTime: "",
                                    endTime: "",
                                    isRecurring: true,
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {daysOfWeek[availability.dayOfWeek]} • {new Date(availability.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(availability.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-xs text-muted-foreground">{availability.isRecurring ? 'Recurring' : 'One-time'} • {availability.isBlocked ? 'Blocked' : 'Active'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingAvailabilityId(availability.id);
                                  setAvailabilityEditForm({
                                    dayOfWeek: availability.dayOfWeek,
                                    startTime: new Date(availability.startTime).toISOString().slice(11, 16),
                                    endTime: new Date(availability.endTime).toISOString().slice(11, 16),
                                    isRecurring: availability.isRecurring ?? true,
                                  });
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteAvailabilityMutation.mutate(availability.id)}
                                disabled={deleteAvailabilityMutation.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No availability entries found. Use the consultant application or availability tools to add availability.</p>
              )}
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