"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, consultantsApi } from "@/lib/api";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ShieldCheck, ShieldX, Loader2, Star } from "lucide-react";
import Link from "next/link";

export default function AdminConsultantsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [confirmConsultant, setConfirmConsultant] = useState<{
    id: string;
    name: string;
    verified: boolean; // true = currently VERIFIED
  } | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-all-consultants", page],
    queryFn: () => adminApi.getAllConsultants({ page, limit: 20 }),
    select: (res) => ({ consultants: res.data.data as any[], total: (res.data.meta?.total ?? 0) as number }),
    enabled: isAuthenticated && isAdmin,
  });

  const { mutate: toggleVerify, isPending: isVerifying } = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      adminApi.verifyConsultant(id, { verificationStatus: verified ? "PENDING" : "VERIFIED" }),
    onSuccess: (_, vars) => {
      toast.success(vars.verified ? "Verification removed." : "Consultant verified.");
      queryClient.invalidateQueries({ queryKey: ["admin-all-consultants"] });
      setConfirmConsultant(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Action failed.");
      setConfirmConsultant(null);
    },
  });

  if (isLoading) return <div className="h-64 animate-pulse rounded-lg bg-muted/30" />;
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Admin access required.</p>
        <Link href="/dashboard"><Button variant="outline" className="mt-4">Dashboard</Button></Link>
      </div>
    );
  }

  const consultants: any[] = data?.consultants ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Consultants</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{total} registered consultants</p>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Consultant</th>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Rating</th>
              <th className="px-4 py-3 text-left font-medium">Verified</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isFetching && consultants.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : consultants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No consultants found.
                </td>
              </tr>
            ) : (
              consultants.map((consultant) => (
                <tr key={consultant.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{consultant.user?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{consultant.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {consultant.professionalTitle || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {consultant.averageRating ? Number(consultant.averageRating).toFixed(1) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={consultant.verificationStatus === "VERIFIED" ? "default" : "secondary"}
                      className={consultant.verificationStatus === "VERIFIED" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
                    >
                      {consultant.verificationStatus ?? "PENDING"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={consultant.verificationStatus === "VERIFIED" ? "outline" : "default"}
                      onClick={() =>
                        setConfirmConsultant({
                          id: consultant.id,
                          name: consultant.user?.name || consultant.user?.email || "Consultant",
                          verified: consultant.verificationStatus === "VERIFIED",
                        })
                      }
                    >
                      {consultant.verificationStatus === "VERIFIED" ? (
                        <><ShieldX className="mr-1.5 h-3.5 w-3.5" />Unverify</>
                      ) : (
                        <><ShieldCheck className="mr-1.5 h-3.5 w-3.5" />Verify</>
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!confirmConsultant} onOpenChange={(open) => { if (!open) setConfirmConsultant(null); }}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmConsultant?.verified ? "Remove verification?" : "Verify consultant?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmConsultant?.verified
                ? `Remove the verified badge from ${confirmConsultant.name}'s profile.`
                : `Grant ${confirmConsultant?.name} a verified consultant badge.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmConsultant &&
                toggleVerify({ id: confirmConsultant.id, verified: confirmConsultant.verified })
              }
              disabled={isVerifying}
            >
              {isVerifying ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
              ) : confirmConsultant?.verified ? (
                "Remove verification"
              ) : (
                <><ShieldCheck className="mr-2 h-4 w-4" />Verify</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
