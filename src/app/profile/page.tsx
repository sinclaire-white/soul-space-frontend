"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, nicknamesApi, usersApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, ShieldCheck, Sparkles, Pencil, Check, X, Camera } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", bio: "", phone: "", age: "" });
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [nicknameCheckLoading, setNicknameCheckLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.getMe(),
    select: (res) => res.data.data,
    enabled: isAuthenticated,
  });

  const { data: nickname } = useQuery({
    queryKey: ["nickname", "me"],
    queryFn: () => nicknamesApi.getMine(),
    select: (res) => res.data.data,
    enabled: isAuthenticated,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (formData: FormData) => usersApi.updateProfile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditingProfile(false);
      setImageFile(null);
      setImagePreview(null);
      toast.success("Profile updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  const updateNicknameMutation = useMutation({
    mutationFn: (handle: string) => nicknamesApi.update(nickname?.id || "", { handle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nickname", "me"] });
      setIsEditingNickname(false);
      toast.success("Nickname updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update nickname");
    },
  });

  const createNicknameMutation = useMutation({
    mutationFn: (handle: string) => nicknamesApi.create({ handle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nickname", "me"] });
      setIsEditingNickname(false);
      toast.success("Nickname created");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create nickname");
    },
  });

  const handleEditProfileStart = () => {
    setProfileForm({
      name: profile?.name || "",
      bio: profile?.bio || "",
      phone: profile?.phone || "",
      age: profile?.age ? String(profile.age) : "",
    });
    setIsEditingProfile(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = () => {
    const fd = new FormData();
    if (profileForm.name.trim()) fd.append("name", profileForm.name.trim());
    if (profileForm.bio.trim()) fd.append("bio", profileForm.bio.trim());
    if (profileForm.phone.trim()) fd.append("phone", profileForm.phone.trim());
    if (profileForm.age) fd.append("age", profileForm.age);
    if (imageFile) fd.append("image", imageFile);
    updateProfileMutation.mutate(fd);
  };

  const handleNicknameInputChange = async (val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setNicknameInput(cleaned);
    setNicknameAvailable(null);
    if (cleaned.length < 3 || cleaned === nickname?.handle) return;
    setNicknameCheckLoading(true);
    try {
      const res = await nicknamesApi.checkAvailability(cleaned);
      setNicknameAvailable(res.data.data?.isAvailable ?? false);
    } catch {
      setNicknameAvailable(null);
    } finally {
      setNicknameCheckLoading(false);
    }
  };

  const handleNicknameSave = () => {
    if (!nicknameInput.trim() || nicknameInput.length < 3) return;
    if (nickname) {
      updateNicknameMutation.mutate(nicknameInput);
    } else {
      createNicknameMutation.mutate(nicknameInput);
    }
  };

  const nicknameSaving = updateNicknameMutation.isPending || createNicknameMutation.isPending;
  const nicknameSaveDisabled =
    !nicknameInput ||
    nicknameInput.length < 3 ||
    (nicknameInput !== nickname?.handle && nicknameAvailable === false) ||
    nicknameSaving;

  if (isLoading) return <div className="min-h-screen bg-muted/30" />;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-3 text-muted-foreground">Sign in to view your profile.</p>
        <Link href="/auth/signin">
          <Button className="mt-6">Sign In</Button>
        </Link>
      </div>
    );
  }

  const displayName = profile?.name || "Soul Space User";
  const initials = displayName
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

        {/* ── Profile Card ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>Your Soul Space identity and details.</CardDescription>
            </div>
            {!isEditingProfile && (
              <Button variant="ghost" size="sm" onClick={handleEditProfileStart}>
                <Pencil className="mr-1 h-4 w-4" /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditingProfile ? (
              <div className="space-y-4">
                {/* Avatar upload */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      {imagePreview ? (
                        <AvatarImage src={imagePreview} />
                      ) : profile?.image ? (
                        <AvatarImage src={profile.image} />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1 text-primary-foreground hover:opacity-90"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-sm text-muted-foreground">Click the camera icon to change your photo</p>
                </div>

                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell others about yourself (max 500 chars)"
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right">{profileForm.bio.length}/500</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      min={13}
                      max={120}
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                      placeholder="Your age"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleProfileSave} disabled={updateProfileMutation.isPending}>
                    <Check className="mr-1 h-4 w-4" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="mr-1 h-4 w-4" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {profile?.image && <AvatarImage src={profile.image} />}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-semibold">{displayName}</h1>
                    {profile?.bio && (
                      <p className="mt-1 text-sm text-muted-foreground">{profile.bio}</p>
                    )}
                    <p className="text-sm text-muted-foreground capitalize">
                      {(profile?.role || "USER").toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" /> Email
                    </div>
                    <p className="mt-2 font-medium">{profile?.email}</p>
                  </div>

                  {profile?.phone && (
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="mt-2 font-medium">{profile.phone}</p>
                    </div>
                  )}

                  {profile?.age && (
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="mt-2 font-medium">{profile.age}</p>
                    </div>
                  )}

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" /> Verification
                    </div>
                    <div className="mt-2">
                      <Badge variant={profile?.emailVerified ? "default" : "secondary"}>
                        {profile?.emailVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* ── Nickname Card ── */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Nickname</CardTitle>
                <CardDescription>Your anonymous community identity.</CardDescription>
              </div>
              {!isEditingNickname && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNicknameInput(nickname?.handle || "");
                    setNicknameAvailable(null);
                    setIsEditingNickname(true);
                  }}
                >
                  <Pencil className="mr-1 h-4 w-4" />
                  {nickname ? "Edit" : "Create"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditingNickname ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Handle</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground select-none">@</span>
                      <Input
                        className="pl-7"
                        value={nicknameInput}
                        onChange={(e) => handleNicknameInputChange(e.target.value)}
                        placeholder="your_handle"
                        maxLength={30}
                      />
                    </div>
                    {nicknameInput.length >= 3 && nicknameInput !== nickname?.handle && (
                      <p
                        className={`text-xs ${
                          nicknameCheckLoading
                            ? "text-muted-foreground"
                            : nicknameAvailable
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {nicknameCheckLoading
                          ? "Checking availability..."
                          : nicknameAvailable
                          ? "✓ Available"
                          : "✗ Already taken"}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      3–30 characters. Letters, numbers and underscores only.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleNicknameSave} disabled={nicknameSaveDisabled}>
                      <Check className="mr-1 h-3 w-3" />
                      {nicknameSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditingNickname(false)}>
                      <X className="mr-1 h-3 w-3" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : nickname ? (
                <div className="space-y-2">
                  <p className="text-2xl font-semibold">@{nickname.handle}</p>
                  <p className="text-sm text-muted-foreground">
                    This handle is what other community members see.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No nickname yet. Click &quot;Create&quot; to set your anonymous identity.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── Privacy Card ── */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Privacy</CardTitle>
              <CardDescription>Control who can see your profile and posts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Public Profile</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.isProfilePublic
                      ? "Anyone can view your profile and posts."
                      : "Your profile is hidden from other users."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const fd = new FormData();
                    fd.append("isProfilePublic", String(!profile?.isProfilePublic));
                    updateProfileMutation.mutate(fd);
                  }}
                  disabled={updateProfileMutation.isPending}
                >
                  {profile?.isProfilePublic ? "Make Private" : "Make Public"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Role status ── */}
          <Card>
            <CardHeader>
              <CardTitle>Role Status</CardTitle>
              <CardDescription>Consultant verification and visibility details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.consultant ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Professional title</span>
                    <span className="font-medium">{profile.consultant.professionalTitle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Verification</span>
                    <Badge variant="secondary">{profile.consultant.verificationStatus}</Badge>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Consultant profile not created yet.
                </div>
              )}
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}