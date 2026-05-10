"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminConsultantApplicationsPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);

  const { data: applicationsResponse } = useQuery({
    queryKey: ["admin-consultant-applications"],
    queryFn: () => adminApi.getConsultantApplications({ page: 1, limit: 50 }),
    enabled: isAuthenticated && isAdmin,
  });

  const applications = applicationsResponse?.data?.data ?? [];

  const { mutate: reviewApplication, isPending: isReviewing } = useMutation({
    mutationFn: ({ id, status, reviewNote }: { id: string; status: "APPROVED" | "REJECTED"; reviewNote?: string }) =>
      adminApi.reviewConsultantApplication(id, { status, reviewNote }),
    onSuccess: (_, variables) => {
      toast.success(`Application ${variables.status.toLowerCase()} successfully.`);
      queryClient.invalidateQueries({ queryKey: ["admin-consultant-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-consultants"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Could not update application status");
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-muted/30" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Consultant Applications</h1>
        <p className="mt-3 text-muted-foreground">Sign in with an admin account to review consultant applications.</p>
        <Link href="/auth/signin">
          <Button className="mt-6">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Admin access required</h1>
        <p className="mt-3 text-muted-foreground">Only administrators can review consultant applications.</p>
        <Link href="/dashboard">
          <Button className="mt-6">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 animate-fade-in">
      <div className="mb-8 flex items-center justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold">Consultant Applications</h1>
          <p className="mt-2 text-muted-foreground">Review submitted documents and approve or reject consultant requests.</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">Back to Admin Overview</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {applications.length === 0 && (
          <Card className="animate-slide-up stagger-1">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No consultant applications found.
            </CardContent>
          </Card>
        )}

        {applications.map((application: any) => (
          <Card key={application.id} className="animate-slide-up stagger-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{application.fullName}</CardTitle>
                  <CardDescription>{application.email}</CardDescription>
                </div>
                <Badge variant={application.status === "PENDING" ? "secondary" : "outline"}>
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Phone:</span> {application.phone}</p>
                <p><span className="text-muted-foreground">Age:</span> {application.age}</p>
                <p className="sm:col-span-2"><span className="text-muted-foreground">Clinic/Hospital:</span> {application.address}</p>
                <p className="sm:col-span-2">
                  <span className="text-muted-foreground">Certification PDF:</span>{" "}
                  <a href={application.certificationDocumentUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                    View document
                  </a>
                </p>
                {application.reviewNote && (
                  <p className="sm:col-span-2"><span className="text-muted-foreground">Review note:</span> {application.reviewNote}</p>
                )}
              </div>

              {application.status === "PENDING" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={isReviewing}
                    onClick={() => reviewApplication({ id: application.id, status: "APPROVED" })}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isReviewing}
                    onClick={() => {
                      setPendingRejectId(application.id);
                      setRejectNote("");
                      setRejectDialogOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Optionally provide a note explaining why this application is being rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rejectNote">Rejection note (optional)</Label>
            <Textarea
              id="rejectNote"
              placeholder="e.g. Incomplete documentation, unverifiable license..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isReviewing}
              onClick={() => {
                if (pendingRejectId) {
                  reviewApplication({
                    id: pendingRejectId,
                    status: "REJECTED",
                    reviewNote: rejectNote.trim() || undefined,
                  });
                }
                setRejectDialogOpen(false);
              }}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
