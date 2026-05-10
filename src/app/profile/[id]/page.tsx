"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, MessageSquare, Lock } from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", params.id],
    queryFn: () => usersApi.getPublicProfile(params.id),
    select: (res) => res.data.data,
  });

  if (isLoading) return <div className="min-h-screen bg-muted/30" />;

  if (!profile) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">User not found</h1>
        <Link href="/feed">
          <Button className="mt-6">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  if (!profile.isProfilePublic) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <Link href="/feed" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Lock className="h-12 w-12 text-muted-foreground" />
          <h1 className="text-2xl font-bold">@{profile.nickname?.handle || "This user"}</h1>
          <p className="text-muted-foreground">This profile is private.</p>
        </div>
      </div>
    );
  }

  const displayName = profile.name || profile.nickname?.handle || "Soul Space User";
  const initials = displayName.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Link href="/feed" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {profile.image && <AvatarImage src={profile.image} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{displayName}</h1>
              {profile.nickname?.handle && (
                <p className="text-muted-foreground">@{profile.nickname.handle}</p>
              )}
              {profile.bio && (
                <p className="mt-2 text-sm">{profile.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Posts</h2>

      {profile.posts?.length === 0 && (
        <p className="text-muted-foreground">No public posts yet.</p>
      )}

      <div className="space-y-4">
        {profile.posts?.map((post: any) => (
          <Card key={post.id}>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-sm">{post.content}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.viewCount}
                </span>
                <Link href={`/posts/${post.id}`} className="flex items-center gap-1 hover:text-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {post._count?.comments || 0}
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
