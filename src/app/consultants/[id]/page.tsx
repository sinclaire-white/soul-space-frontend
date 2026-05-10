"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { bookingsApi, consultantsApi, reviewsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock3, Star } from "lucide-react";
import { toast } from "sonner";

const getDefaultSchedule = () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  date.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function ConsultantDetailPage() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [scheduledAt, setScheduledAt] = useState(getDefaultSchedule());
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [preSessionNotes, setPreSessionNotes] = useState("");

  const { data: consultant, isLoading } = useQuery({
    queryKey: ["consultant", params.id],
    queryFn: () => consultantsApi.getById(params.id),
    select: (res) => res.data.data,
  });

  const { data: reviews } = useQuery({
    queryKey: ["consultant-reviews", params.id],
    queryFn: () => reviewsApi.getByConsultant(params.id, { page: 1, limit: 10 }),
    select: (res) => res.data.data,
  });

  const { data: reviewStats } = useQuery({
    queryKey: ["consultant-review-stats", params.id],
    queryFn: () => reviewsApi.getStats(params.id),
    select: (res) => res.data.data,
  });

  const bookingMutation = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        consultantId: params.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(durationMinutes),
        preSessionNotes: preSessionNotes || undefined,
      }),
    onSuccess: () => {
      toast.success("Booking request sent successfully");
      setPreSessionNotes("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create booking");
    },
  });

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
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold">{consultant.user?.name || "Consultant"}</h1>
                    <Badge variant="secondary">{consultant.verificationStatus}</Badge>
                  </div>
                  <p className="mt-2 text-lg text-muted-foreground">{consultant.professionalTitle}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-4 w-4" />{reviewStats?.averageRating?.toFixed?.(1) || consultant.averageRating?.toFixed?.(1) || "New"}</span>
                    <span className="flex items-center gap-1"><Clock3 className="h-4 w-4" />{consultant.yearsExperience} years experience</span>
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />${consultant.hourlyRate}/hour</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-muted-foreground">{consultant.bio || "No biography provided yet."}</p>
              <div className="flex flex-wrap gap-2">
                {consultant.specializations?.map((specialization: string) => (
                  <Badge key={specialization} variant="outline">{specialization}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Feedback from completed sessions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews?.reviews?.length ? reviews.reviews.map((review: any) => (
                <div key={review.id} className="rounded-lg border p-4 flex flex-col min-h-35">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{review.client?.nickname?.handle || "Community member"}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground flex-1">{review.content || "No written feedback provided."}</p>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-foreground text-foreground" : "text-muted-foreground/30"}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">{review.rating}/5</span>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">No public reviews yet.</p>}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Book a session</CardTitle>
            <CardDescription>Choose a time at least 24 hours in advance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date and time</Label>
              <Input id="scheduledAt" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration in minutes</Label>
              <Input id="durationMinutes" type="number" min={30} step={30} value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preSessionNotes">What would you like support with?</Label>
              <Textarea
                id="preSessionNotes"
                value={preSessionNotes}
                onChange={(event) => setPreSessionNotes(event.target.value)}
                placeholder="Share a few details so the consultant can prepare"
              />
            </div>

            {isAuthenticated ? (
              <Button className="w-full" onClick={() => bookingMutation.mutate()} disabled={bookingMutation.isPending}>
                {bookingMutation.isPending ? "Booking..." : "Request Booking"}
              </Button>
            ) : (
              <Link href="/auth/signin">
                <Button className="w-full">Sign In to Book</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}