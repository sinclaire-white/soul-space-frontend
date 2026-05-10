"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, nicknamesApi, votesApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { POST_VISIBILITY } from "@/lib/constants";
import { MessageSquare, Eye, Shield, ThumbsUp, ThumbsDown } from "lucide-react";
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
    nickname?: { handle: string; avatarUrl?: string | null } | null;
  };
  nickname?: {
    handle: string;
  };
  _count?: {
    comments: number;
  };
  upvotes?: number;
  downvotes?: number;
  userVote?: "UPVOTE" | "DOWNVOTE" | null;
}

export default function FeedPage() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: myNickname } = useQuery({
    queryKey: ["nickname", "me"],
    queryFn: () => nicknamesApi.getMine(),
    select: (res) => res.data.data,
    enabled: isAuthenticated,
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => postsApi.getAll({ page: 1, limit: 20 }),
    select: (res) => ({
      posts: Array.isArray(res.data.data) ? res.data.data : [],
      total: res.data.meta?.total ?? 0,
    }),
  });

  const createPostMutation = useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setNewPost("");
      setIsAnonymous(false);
      toast.success("Post created successfully");
    },
    onError: () => {
      toast.error("Failed to create post");
    },
  });

  const voteMutation = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: "UPVOTE" | "DOWNVOTE" }) =>
      type === "UPVOTE" ? votesApi.upvote(postId) : votesApi.downvote(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(msg === "You cannot react to your own post" ? "You can't vote on your own post" : "Failed to vote");
    },
  });

  const handleVote = (postId: string, type: "UPVOTE" | "DOWNVOTE") => {
    if (!isAuthenticated) {
      toast.error("Please log in to vote");
      return;
    }
    voteMutation.mutate({ postId, type });
  };

  const handleSubmitPost = () => {
    if (!newPost.trim()) return;
    createPostMutation.mutate({
      content: newPost,
      isAnonymous,
      visibleTo: POST_VISIBILITY.PUBLIC,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold animate-slide-up">Community Feed</h1>

      {/* Create Post */}
      {isAuthenticated && (
        <Card className="mb-8 animate-slide-up stagger-1">
          <CardContent className="pt-6">
            <Textarea
              placeholder="Share your thoughts... (max 2000 characters)"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              maxLength={2000}
              className="min-h-30 resize-none"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Shield className="h-4 w-4" />
                  Post anonymously
                </label>
                {isAnonymous && (
                  <p className="ml-1 text-xs text-muted-foreground">
                    {myNickname ? `Posting as @${myNickname.handle}` : "No nickname set â€” go to your profile to create one"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {newPost.length}/2000
                </span>
                <Button
                  onClick={handleSubmitPost}
                  disabled={!newPost.trim() || createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <Tabs defaultValue="latest" className="mb-6 animate-slide-up stagger-2">
        <TabsList>
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-40" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {postsData?.posts?.map((post: Post) => {
            const authorHandle = post.isAnonymous
              ? null
              : post.author?.nickname?.handle || post.nickname?.handle || null;
            const authorId = post.author?.id;

            return (
              <Card key={post.id} className="animate-slide-up stagger-3">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={post.isAnonymous ? undefined : (post.author?.nickname?.avatarUrl ?? undefined)}
                          alt={authorHandle || "User"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {post.isAnonymous ? "?" : authorHandle?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {post.isAnonymous || !authorId ? (
                          <p className="font-medium">Anonymous</p>
                        ) : (
                          <Link
                            href={`/profile/${authorId}`}
                            className="font-medium hover:underline"
                          >
                            {authorHandle || "Unknown"}
                          </Link>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    {post.visibleTo === "CONSULTANTS_ONLY" && (
                      <Badge variant="secondary">Consultants Only</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-0">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 gap-1"
                      onClick={() => handleVote(post.id, "UPVOTE")}
                      disabled={voteMutation.isPending}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {post.upvotes !== undefined && (
                        <span className="text-xs">{post.upvotes}</span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 gap-1"
                      onClick={() => handleVote(post.id, "DOWNVOTE")}
                      disabled={voteMutation.isPending}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      {post.downvotes !== undefined && (
                        <span className="text-xs">{post.downvotes}</span>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.viewCount}</span>
                    </div>
                    <Link
                      href={`/posts/${post.id}`}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{post._count?.comments || 0}</span>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
