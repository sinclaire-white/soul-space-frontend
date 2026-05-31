// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { authApi } from "@/lib/api";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { KeyRound, AlertCircle } from "lucide-react";
// import { toast } from "sonner";

// export default function ForgotPasswordPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setError("");
//     setIsSubmitting(true);

//     try {
//       await authApi.forgotPassword({ email });
//       toast.success("Password reset code sent.");
//       router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to request password reset");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-2 text-center">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
//             <KeyRound className="h-6 w-6" />
//           </div>
//           <CardTitle>Forgot your password?</CardTitle>
//           <CardDescription>
//             We&apos;ll send a one-time code so you can reset it safely.
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
//                 placeholder="you@example.com"
//                 required
//               />
//             </div>

//             <Button type="submit" className="w-full" disabled={isSubmitting}>
//               {isSubmitting ? "Sending code..." : "Send Reset Code"}
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