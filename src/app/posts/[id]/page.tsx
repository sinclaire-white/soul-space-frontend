"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsApi, postsApi, votesApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [comment, setComment] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", params.id],
    queryFn: () => postsApi.getById(params.id),
    select: (res) => res.data.data,
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", params.id],
    queryFn: () => commentsApi.getByPost(params.id, { page: 1, limit: 50 }),
    select: (res) => res.data.data,
  });

  const commentMutation = useMutation({
    mutationFn: () => commentsApi.create({ postId: params.id, content: comment }),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", params.id] });
      toast.success("Comment posted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to post comment");
    },
  });

  const voteMutation = useMutation({
    mutationFn: ({ type }: { type: "UPVOTE" | "DOWNVOTE" }) =>
      type === "UPVOTE" ? votesApi.upvote(params.id) : votesApi.downvote(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", params.id] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(msg === "You cannot react to your own post" ? "You can't vote on your own post" : "Failed to vote");
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-muted/30" />;
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Post not found</h1>
        <Link href="/feed">
          <Button className="mt-6">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Link href="/feed" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>
              {post.isAnonymous
                ? "Anonymous post"
                : post.author?.id
                ? <Link href={`/profile/${post.author.id}`} className="hover:underline">{post.author?.nickname?.handle || "Community post"}</Link>
                : post.author?.nickname?.handle || "Community post"}
            </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{post.status}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                {post.viewCount}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="whitespace-pre-wrap text-base leading-7">{post.content}</p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!isAuthenticated) { toast.error("Please log in to vote"); return; }
                voteMutation.mutate({ type: "UPVOTE" });
              }}
              disabled={voteMutation.isPending}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Upvote{post.upvotes !== undefined ? ` (${post.upvotes})` : ""}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!isAuthenticated) { toast.error("Please log in to vote"); return; }
                voteMutation.mutate({ type: "DOWNVOTE" });
              }}
              disabled={voteMutation.isPending}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Downvote{post.downvotes !== undefined ? ` (${post.downvotes})` : ""}
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-2 font-medium">
              <MessageSquare className="h-4 w-4" />
              Comments
            </div>
            {isAuthenticated ? (
              <div className="mb-4 space-y-3">
                <Textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Write a thoughtful reply"
                  maxLength={1000}
                />
                <Button
                  onClick={() => commentMutation.mutate()}
                  disabled={!comment.trim() || commentMutation.isPending}
                >
                  {commentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            ) : (
              <p className="mb-4 text-sm text-muted-foreground">Sign in to join the conversation.</p>
            )}

            <div className="space-y-3">
              {comments?.length ? comments.map((item: any) => (
                <div key={item.id} className="rounded-lg bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.isAnonymous ? "Anonymous" : item.author?.nickname?.handle || "Community member"}</p>
                    <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.content}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No comments yet.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}