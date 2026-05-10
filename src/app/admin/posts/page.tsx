"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
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
import { Trash2, Loader2, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminPostsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [confirmPost, setConfirmPost] = useState<{ id: string; preview: string } | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-all-posts", page],
    queryFn: () => adminApi.getAllPosts({ page, limit: 20 }),
    select: (res) => ({ posts: res.data.data as any[], total: (res.data.meta?.total ?? 0) as number }),
    enabled: isAuthenticated && isAdmin,
  });

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => adminApi.deletePost(id),
    onSuccess: () => {
      toast.success("Post deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-all-posts"] });
      setConfirmPost(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete post.");
      setConfirmPost(null);
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

  const posts: any[] = data?.posts ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{total} total posts</p>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Content</th>
              <th className="px-4 py-3 text-left font-medium">Author</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Posted</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isFetching && posts.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No posts found.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="line-clamp-2 text-sm">
                      {post.isAnonymous ? (
                        <span className="italic text-muted-foreground">[Anonymous] </span>
                      ) : null}
                      {post.content}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {post.author?.nickname?.handle
                      ? `@${post.author.nickname.handle}`
                      : post.author?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={post.status === "ACTIVE" ? "default" : "secondary"}>
                      {post.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/posts/${post.id}`} target="_blank">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setConfirmPost({ id: post.id, preview: post.content.slice(0, 80) })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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

      <AlertDialog open={!!confirmPost} onOpenChange={(open) => { if (!open) setConfirmPost(null); }}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone.
              {confirmPost?.preview && (
                <span className="mt-2 block rounded-md bg-muted px-3 py-2 text-xs italic">
                  "{confirmPost.preview}{confirmPost.preview.length >= 80 ? "…" : ""}"
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmPost && deletePost(confirmPost.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</>
              ) : (
                <><Trash2 className="mr-2 h-4 w-4" />Delete Post</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
