"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, MessageSquare, Trash2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Post {
  id: string;
  content: string;
  status: string;
  isAnonymous: boolean;
  visibleTo: string;
  viewCount: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image?: string | null;
    nickname?: { handle: string; avatarUrl?: string | null } | null;
  };
  nickname?: {
    handle: string;
  };
  _count?: {
    comments: number;
  };
}

export default function MyPostsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const limit = 10;

  const { data: myPostsData, isLoading } = useQuery({
    queryKey: ["my-posts", page],
    queryFn: () => postsApi.getMyPosts({ page, limit }),
    select: (res) => ({
      posts: Array.isArray(res.data.data) ? res.data.data : [],
      total: res.data.meta?.total ?? 0,
    }),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => postsApi.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      setDeletePostId(null);
      toast.success("Post deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete post");
    },
  });

  if (isAuthLoading) {
    return <div className="min-h-screen bg-muted/30" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <h1 className="text-3xl font-bold">Sign in to view your posts</h1>
        <p className="mt-3 text-muted-foreground">
          You need to be logged in to view and manage your posts.
        </p>
        <Link href="/auth/signin">
          <Button className="mt-6">Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  const totalPages = myPostsData ? Math.ceil(myPostsData.total / limit) : 1;
  const posts = myPostsData?.posts || [];

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl animate-fade-in">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          My Posts
        </h1>
        <p className="text-muted-foreground">
          Manage and view all your posts ({myPostsData?.total || 0} total)
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="animate-slide-up">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't created any posts yet. Start by sharing your thoughts on the feed!
            </p>
            <Link href="/feed">
              <Button>Go to Feed</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post: Post, index: number) => (
              <Card key={post.id} className="transition-all duration-300 hover:shadow-md animate-slide-up stagger-1" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.isAnonymous ? (post.author?.nickname?.avatarUrl ?? undefined) : (post.author?.image ?? post.author?.nickname?.avatarUrl ?? undefined)} />
                          <AvatarFallback>{post.author?.name?.charAt(0) || (post.author?.nickname?.handle?.[0] ?? "U")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {post.isAnonymous ? (post.author?.nickname?.handle || "Anonymous") : (post.author?.name || post.author?.nickname?.handle || "Unknown")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">{post.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <Link href={`/posts/${post.id}`} className="group cursor-pointer">
                    <p className="text-sm leading-relaxed line-clamp-3 group-hover:text-primary transition-colors">
                      {post.content}
                    </p>
                  </Link>
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.viewCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post._count?.comments || 0}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Link href={`/posts/${post.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletePostId(post.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2 animate-slide-up stagger-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => page > 1 && setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <span key={pageNum} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => page < totalPages && setPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletePostId !== null} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletePostId) {
                  deleteMutation.mutate(deletePostId);
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
