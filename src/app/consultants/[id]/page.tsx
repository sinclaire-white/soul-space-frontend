"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { bookingsApi, consultantsApi, reviewsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock3, Star, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function ConsultantDetailPage() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [selectedTime, setSelectedTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [preSessionNotes, setPreSessionNotes] = useState("");

  const { data: consultant, isLoading } = useQuery({
    queryKey: ["consultant", params.id],
    queryFn: () => consultantsApi.getById(params.id),
    select: (res) => res.data.data,
  });

  const { data: slotSchedules } = useQuery({
    queryKey: ["consultant-slots", params.id, selectedDate],
    queryFn: () =>
      bookingsApi
        .getAvailability(params.id, selectedDate)
        .then((res) => res.data.data),
    enabled: !!params.id && !!selectedDate,
  });

  const { data: reviews } = useQuery({
    queryKey: ["consultant-reviews", params.id],
    queryFn: () =>
      reviewsApi.getByConsultant(params.id, { page: 1, limit: 10 }),
    select: (res) => res.data.data,
  });

  const { data: reviewStats } = useQuery({
    queryKey: ["consultant-review-stats", params.id],
    queryFn: () => reviewsApi.getStats(params.id),
    select: (res) => res.data.data,
  });

  useEffect(() => {
    setSelectedTime("");
  }, [selectedDate]);

  const selectedDateSlots = useMemo(() => {
    if (!slotSchedules?.length) return [];
    const schedule = slotSchedules.find((s: any) => {
      const scheduleDate = new Date(s.date).toISOString().slice(0, 10);
      return scheduleDate === selectedDate;
    });
    return schedule?.slots?.filter((slot: any) => slot.isAvailable) || [];
  }, [slotSchedules, selectedDate]);

  const isDateAvailable = useMemo(() => {
    if (!consultant?.availabilities?.length) return false;
    const day = new Date(`${selectedDate}T00:00:00Z`).getUTCDay();
    return consultant.availabilities.some(
      (a: any) => !a.isBlocked && a.dayOfWeek === day,
    );
  }, [selectedDate, consultant?.availabilities]);

  const bookingMutation = useMutation({
    mutationFn: () => {
      if (!selectedTime) {
        throw new Error("Please select a time slot");
      }
      const iso = new Date(`${selectedDate}T${selectedTime}:00Z`).toISOString();
      return bookingsApi.create({
        consultantId: params.id,
        scheduledAt: iso,
        durationMinutes: Number(durationMinutes),
        preSessionNotes: preSessionNotes || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Booking request sent successfully");
      setSelectedTime("");
      setPreSessionNotes("");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create booking",
      );
    },
  });

  const handleBookingRequest = () => {
    if (!consultant) return;
    if (!isDateAvailable) {
      toast.error("Consultant is not available on the selected day");
      return;
    }
    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }
    bookingMutation.mutate();
  };

  const initials = useMemo(() => {
    const name = consultant?.user?.name || "Consultant";
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [consultant?.user?.name]);

  if (isLoading) {
    return <div className="min-h-screen bg-muted/30" />;
  }

  if (!consultant) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Consultant not found</h1>
        <Link href="/consultants">
          <Button className="mt-6">Back to consultants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  {consultant.user?.image ? (
                    <AvatarImage src={consultant.user.image} />
                  ) : consultant.user?.nickname?.avatarUrl ? (
                    <AvatarImage src={consultant.user.nickname.avatarUrl} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold">
                      {consultant.user?.name || "Consultant"}
                    </h1>
                    <Badge variant="secondary">
                      {consultant.verificationStatus}
                    </Badge>
                  </div>
                  <p className="mt-2 text-lg text-muted-foreground">
                    {consultant.professionalTitle}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {reviewStats?.averageRating?.toFixed?.(1) ||
                        consultant.averageRating?.toFixed?.(1) ||
                        "New"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {consultant.yearsExperience} years experience
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {typeof consultant.hourlyRate === "number" ? (
                        <>{`$${consultant.hourlyRate}/hr`}</>
                      ) : (
                        <span className="text-muted-foreground">
                          Contact for rates
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly availability</CardTitle>
              <CardDescription>
                Available days and time windows for booking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consultant?.availabilities?.filter((a: any) => !a.isBlocked)
                .length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(
                        consultant.availabilities
                          .filter((a: any) => !a.isBlocked)
                          .map((a: any) => a.dayOfWeek),
                      ),
                    )
                      .sort()
                      .map((dayIndex: any) => (
                        <Badge
                          key={dayIndex}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          {daysOfWeek[dayIndex]}
                        </Badge>
                      ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sessions available from 10:00 AM to 10:00 PM UTC.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  No published availability yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-muted-foreground">
                {consultant.bio || "No biography provided yet."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                Feedback from completed sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews?.reviews?.length ? (
                reviews.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="rounded-lg border p-4 flex flex-col min-h-35"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {review.client?.nickname?.handle || "Community member"}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground flex-1">
                      {review.content || "No written feedback provided."}
                    </p>
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-foreground text-foreground" : "text-muted-foreground/30"}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No public reviews yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit sticky top-6">
          <CardHeader>
            <CardTitle>Book a session</CardTitle>
            <CardDescription>
              Choose a date and time slot at least 24 hours in advance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="selectedDate">Date</Label>
              <Input
                id="selectedDate"
                type="date"
                value={selectedDate}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10)}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
              {selectedDate && (
                <div
                  className={`flex items-center gap-1.5 text-sm ${isDateAvailable ? "text-green-600" : "text-red-500"}`}
                >
                  {isDateAvailable ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Consultant is available on this day</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>Consultant is not available on this day</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="selectedTime">Time slot</Label>
              <select
                id="selectedTime"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full rounded-md border bg-input px-3 py-2"
                disabled={!isDateAvailable || selectedDateSlots.length === 0}
              >
                <option value="">Select a time</option>
                {selectedDateSlots.map((slot: any) => {
                  const timeStr = new Date(slot.startTime)
                    .toISOString()
                    .slice(11, 16);
                  const displayTime = new Date(
                    slot.startTime,
                  ).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "UTC",
                  });
                  return (
                    <option key={timeStr} value={timeStr}>
                      {displayTime} UTC
                    </option>
                  );
                })}
                {isDateAvailable && selectedDateSlots.length === 0 && (
                  <option value="" disabled>
                    No available slots for selected day
                  </option>
                )}
                {!isDateAvailable && (
                  <option value="" disabled>
                    Consultant not available on this day
                  </option>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                min={30}
                step={30}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 30 minutes. Must end by 10:00 PM UTC.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preSessionNotes">
                What would you like support with?
              </Label>
              <Textarea
                id="preSessionNotes"
                value={preSessionNotes}
                onChange={(event) => setPreSessionNotes(event.target.value)}
                placeholder="Share a few details so the consultant can prepare"
                rows={4}
              />
            </div>

            {isAuthenticated ? (
              <Button
                className="w-full"
                onClick={handleBookingRequest}
                disabled={
                  bookingMutation.isPending || !isDateAvailable || !selectedTime
                }
              >
                {bookingMutation.isPending
                  ? "Sending request..."
                  : "Request Booking"}
              </Button>
            ) : (
              <Link href="/auth/signin" className="block">
                <Button className="w-full">Sign In to Book</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
