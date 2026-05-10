"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { consultantApplicationsApi } from "@/lib/api";
import { useAuth, useIsConsultant } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Clock, FileUp, ShieldCheck, Upload, X, XCircle } from "lucide-react";
import { toast } from "sonner";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function PaymentStep({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  const handleConfirmPayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setError("");
    setIsConfirming(true);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || "Payment could not be completed");
      setIsConfirming(false);
      return;
    }

    onSuccess();
    setIsConfirming(false);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="button" onClick={handleConfirmPayment} disabled={!stripe || !elements || isConfirming}>
        {isConfirming ? "Confirming payment..." : "Confirm $10 Payment"}
      </Button>
    </div>
  );
}

export default function ConsultantApplyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isConsultant = useIsConsultant();

  const { data: existingApplication, isLoading: isLoadingApplication } = useQuery({
    queryKey: ["consultant-application", "mine"],
    queryFn: () => consultantApplicationsApi.getMine(),
    select: (res) => res.data.data,
    enabled: isAuthenticated && !isConsultant,
    retry: false,
  });

  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reapplying, setReapplying] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    age: "",
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isFormValid = useMemo(() => {
    return Boolean(
      formData.fullName.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.address.trim() &&
      formData.age.trim() &&
      documentFile &&
      paymentIntentId &&
      isPaymentComplete
    );
  }, [documentFile, formData, isPaymentComplete, paymentIntentId]);

  const handleCreatePaymentIntent = async () => {
    setError("");
    setIsCreatingIntent(true);

    try {
      const response = await consultantApplicationsApi.createPaymentIntent();
      setClientSecret(response.data.data.clientSecret);
      setPaymentIntentId(response.data.data.paymentIntentId);
      toast.success("Payment session created. Complete the payment below.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not initialize payment");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handleSubmitApplication = async (e: FormEvent) => {
    e.preventDefault();

    if (!documentFile || !paymentIntentId) {
      setError("Complete payment and upload your certification PDF before submitting.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("fullName", formData.fullName.trim());
      payload.append("email", formData.email.trim());
      payload.append("phone", formData.phone.trim());
      payload.append("address", formData.address.trim());
      payload.append("age", formData.age.trim());
      payload.append("paymentIntentId", paymentIntentId);
      payload.append("certificationDocument", documentFile);

      await consultantApplicationsApi.submit(payload);
      toast.success("Your consultant application has been submitted for admin review.");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit consultant application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingApplication) {
    return <div className="min-h-screen bg-muted/30" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Become a Consultant</h1>
        <p className="mt-3 text-muted-foreground">Sign in first to submit your consultant application.</p>
        <Link href="/auth/signin">
          <Button className="mt-6">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isConsultant) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">You are already a consultant</h1>
        <p className="mt-3 text-muted-foreground">Your account already has consultant access.</p>
        <Link href="/consultant/dashboard">
          <Button className="mt-6">Go to Consultant Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (existingApplication?.status === "PENDING") {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16">
        <Card className="text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold">Application Under Review</h1>
            <p className="text-muted-foreground">
              Your consultant application has been submitted and is currently being reviewed by our admin team.
              We'll notify you once a decision has been made.
            </p>
            <Badge variant="secondary" className="text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
              Pending Review
            </Badge>
            <div className="pt-4 space-y-2">
              <p className="text-xs text-muted-foreground">Submitted as: <strong>{existingApplication.fullName}</strong></p>
              <p className="text-xs text-muted-foreground">Email: <strong>{existingApplication.email}</strong></p>
            </div>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (existingApplication?.status === "REJECTED") {
    if (!reapplying) {
      return (
        <div className="container mx-auto max-w-lg px-4 py-16">
          <Card>
            <CardContent className="pt-10 pb-8 space-y-5">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Application Not Approved</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Unfortunately your previous application was not approved.
                  </p>
                </div>
              </div>

              {existingApplication.reviewNote && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-sm font-semibold text-destructive">Reason for rejection</p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed pl-6">
                    {existingApplication.reviewNote}
                  </p>
                </div>
              )}

              <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground text-center">
                You may submit a new application with updated information.
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => setReapplying(true)} className="w-full">Apply Again</Button>
                <Link href="/dashboard" className="w-full">
                  <Button variant="ghost" size="sm" className="w-full">Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  if (!stripePromise) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable consultant applications.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 animate-fade-in">
      <Card className="animate-slide-up">
        <CardHeader className="animate-slide-up stagger-1">
          <CardTitle className="text-2xl">Consultant Application</CardTitle>
          <CardDescription>
            Submit your required details, upload certification proof (PDF), pay the $10 application fee, then submit for admin review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 animate-slide-up stagger-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmitApplication} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Clinic or Hospital Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificationDocument">Certification Document (PDF)</Label>
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 transition-colors duration-300 hover:border-primary/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Upload className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upload your certificate (PDF)</p>
                      <p className="text-xs text-muted-foreground">Max file size: 10MB</p>
                    </div>
                  </div>
                  <Label
                    htmlFor="certificationDocument"
                    className="inline-flex h-9 cursor-pointer items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    {documentFile ? "Replace" : "Choose file"}
                  </Label>
                </div>
                <Input
                  id="certificationDocument"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  required={!documentFile}
                  className="hidden"
                />

                {documentFile ? (
                  <div className="mt-4 flex items-center justify-between rounded-md bg-background px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{documentFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(documentFile.size)}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setDocumentFile(null)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">No file selected yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Application Fee</p>
                  <p className="text-sm text-muted-foreground">One-time payment required before submission.</p>
                </div>
                <Badge variant="secondary">$10</Badge>
              </div>

              {!clientSecret && (
                <Button type="button" onClick={handleCreatePaymentIntent} disabled={isCreatingIntent}>
                  {isCreatingIntent ? "Preparing payment..." : "Pay $10 with Stripe"}
                </Button>
              )}

              {clientSecret && !isPaymentComplete && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentStep
                    clientSecret={clientSecret}
                    onSuccess={() => {
                      setIsPaymentComplete(true);
                      toast.success("Payment completed successfully.");
                    }}
                  />
                </Elements>
              )}

              {isPaymentComplete && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Payment completed</span>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <ShieldCheck className="h-4 w-4" />
                Review flow
              </div>
              <p className="mt-2">After submission, admins will verify your information and documents before approving or rejecting your consultant application.</p>
            </div>

            <Button type="submit" disabled={!isFormValid || isSubmitting} className="w-full">
              <FileUp className="mr-2 h-4 w-4" />
              {isSubmitting ? "Submitting application..." : "Submit Consultant Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
