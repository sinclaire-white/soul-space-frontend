"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useAuth, useIsAdmin, useIsSuperAdmin } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, UserX, UserCheck, Loader2, Shield, ShieldPlus, ShieldMinus } from "lucide-react";
import Link from "next/link";

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  CONSULTANT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  USER: "bg-muted text-muted-foreground",
};

export default function AdminUsersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmUser, setConfirmUser] = useState<{ id: string; name: string; active: boolean } | null>(null);
  const [confirmRole, setConfirmRole] = useState<{ id: string; name: string; makeAdmin: boolean } | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-all-users", page, search],
    queryFn: () => adminApi.getAllUsers({ page, limit: 20, search: search || undefined }),
    select: (res) => ({ users: res.data.data as any[], total: (res.data.meta?.total ?? 0) as number }),
    enabled: isAuthenticated && isAdmin,
  });

  const { mutate: toggleActive, isPending: isToggling } = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? adminApi.deactivateUser(id) : adminApi.activateUser(id),
    onSuccess: (_, vars) => {
      toast.success(vars.active ? "User deactivated." : "User activated.");
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      setConfirmUser(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Action failed.");
      setConfirmUser(null);
    },
  });

  const { mutate: changeRole, isPending: isChangingRole } = useMutation({
    mutationFn: ({ id, makeAdmin }: { id: string; makeAdmin: boolean }) =>
      adminApi.changeUserRole(id, makeAdmin ? "ADMIN" : "USER"),
    onSuccess: (_, vars) => {
      toast.success(vars.makeAdmin ? "User promoted to admin." : "Admin role removed.");
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      setConfirmRole(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Role change failed.");
      setConfirmRole(null);
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

  const users: any[] = data?.users ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total accounts</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isFetching && users.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{user.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[user.role] ?? roleColors.USER}`}>
                      {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? <Shield className="h-3 w-3" /> : null}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Make/Remove Admin — super admin only, can't touch SUPER_ADMIN */}
                      {isSuperAdmin && user.role !== "SUPER_ADMIN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setConfirmRole({
                              id: user.id,
                              name: user.name || user.email,
                              makeAdmin: user.role !== "ADMIN",
                            })
                          }
                        >
                          {user.role === "ADMIN" ? (
                            <><ShieldMinus className="mr-1.5 h-3.5 w-3.5" />Remove Admin</>
                          ) : (
                            <><ShieldPlus className="mr-1.5 h-3.5 w-3.5" />Make Admin</>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={user.isActive ? "destructive" : "outline"}
                        onClick={() => setConfirmUser({ id: user.id, name: user.name || user.email, active: user.isActive })}
                        disabled={user.role === "SUPER_ADMIN"}
                      >
                        {user.isActive ? (
                          <><UserX className="mr-1.5 h-3.5 w-3.5" />Deactivate</>
                        ) : (
                          <><UserCheck className="mr-1.5 h-3.5 w-3.5" />Activate</>
                        )}
                      </Button>
                    </div>
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

      <AlertDialog open={!!confirmUser} onOpenChange={(open) => { if (!open) setConfirmUser(null); }}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmUser?.active ? "Deactivate user?" : "Activate user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmUser?.active
                ? `This will deactivate ${confirmUser.name}'s account. They won't be able to sign in.`
                : `This will re-activate ${confirmUser?.name}'s account.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmUser?.active ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={() => confirmUser && toggleActive({ id: confirmUser.id, active: confirmUser.active })}
              disabled={isToggling}
            >
              {isToggling ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
              ) : confirmUser?.active ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role change confirmation */}
      <AlertDialog open={!!confirmRole} onOpenChange={(open) => { if (!open) setConfirmRole(null); }}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmRole?.makeAdmin ? "Promote to admin?" : "Remove admin role?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRole?.makeAdmin
                ? `${confirmRole.name} will be granted admin access and can manage users, posts, and consultants.`
                : `${confirmRole?.name} will lose admin access and be reverted to a regular user.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingRole}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={!confirmRole?.makeAdmin ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={() => confirmRole && changeRole({ id: confirmRole.id, makeAdmin: confirmRole.makeAdmin })}
              disabled={isChangingRole}
            >
              {isChangingRole ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
              ) : confirmRole?.makeAdmin ? (
                <><ShieldPlus className="mr-2 h-4 w-4" />Make Admin</>
              ) : (
                <><ShieldMinus className="mr-2 h-4 w-4" />Remove Admin</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
