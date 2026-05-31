// "use client";

// import { Suspense, useState } from "react";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { authApi } from "@/lib/api";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { MailCheck, AlertCircle } from "lucide-react";
// import { toast } from "sonner";

// function VerifyEmailContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [otp, setOtp] = useState("");
//   const [email, setEmail] = useState(searchParams.get("email") || "");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setError("");
//     setIsSubmitting(true);

//     try {
//       await authApi.verifyEmail({ email, otp });
//       toast.success("Email verified. You can sign in now.");
//       router.push(`/auth/signin?email=${encodeURIComponent(email)}`);
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to verify email");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-2 text-center">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
//             <MailCheck className="h-6 w-6" />
//           </div>
//           <CardTitle>Verify your email</CardTitle>
//           <CardDescription>
//             Enter the 6-digit code sent to your email address.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {error ? (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           ) : null}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(event) => setEmail(event.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="otp">Verification code</Label>
//               <Input
//                 id="otp"
//                 inputMode="numeric"
//                 pattern="[0-9]{6}"
//                 maxLength={6}
//                 value={otp}
//                 onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
//                 placeholder="123456"
//                 required
//               />
//             </div>

//             <Button type="submit" className="w-full" disabled={isSubmitting}>
//               {isSubmitting ? "Verifying..." : "Verify Email"}
//             </Button>
//           </form>
//         </CardContent>
//         <CardFooter className="justify-center text-sm text-muted-foreground">
//           <Link href="/auth/signin" className="text-primary hover:underline">
//             Back to sign in
//           </Link>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

// export default function VerifyEmailPage() {
//   return (
//     <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
//       <VerifyEmailContent />
//     </Suspense>
//   );
// }