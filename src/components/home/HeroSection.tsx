"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Users, ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { useAuth } from "@/hooks/useAuth";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-primary/5 via-background to-background py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimateOnScroll animation="slide-up" className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="h-4 w-4" />
              <span>100% Anonymous & Secure</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Your Safe Space for{" "}
              <span className="text-primary">Mental Wellness</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Connect anonymously with a supportive community and access verified
              mental health professionals. Share your thoughts, find comfort, and
              begin your healing journey in a judgment-free environment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link href="/feed">
                  <Button size="lg" className="gap-2">
                    Go to Feed
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button size="lg" className="gap-2">
                    Join Community
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href="/consultants">
                <Button size="lg" variant="outline">
                  Find a Consultant
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">10K+</strong> Members
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">500+</strong> Consultants
                </span>
              </div>
            </div>
          </AnimateOnScroll>
          
          {/* Illustration */}
          <AnimateOnScroll animation="scale-in" delay={0.2} className="relative hidden lg:block">
            <div className="relative z-10 ml-auto max-w-xl rounded-4xl border border-border/40 bg-linear-to-br from-primary/15 via-background to-secondary/10 p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.28)]">
              <div className="space-y-5">
                {/* Sample Post Card */}
                <div className="rounded-2xl border border-border/50 bg-background/95 p-5 shadow-lg shadow-black/5 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      hs
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          @hopeful_soul
                        </p>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                          Anonymous
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        shared a check-in just now
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-primary/5 p-4">
                    <p className="text-sm leading-7 text-foreground/80">
                      &ldquo;Today was difficult, but I&apos;m grateful for this community.
                      Your support means everything.&rdquo;
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="rounded-full bg-muted px-3 py-1.5">💙 24</span>
                    <span className="rounded-full bg-muted px-3 py-1.5">🤗 12</span>
                    <span className="rounded-full bg-muted px-3 py-1.5">🫂 8</span>
                  </div>
                </div>
                
                {/* Consultant Card */}
                <div className="ml-10 rounded-2xl border border-border/50 bg-background/95 p-5 shadow-lg shadow-black/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 ring-4 ring-emerald-50">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Dr. Sarah Chen</p>
                      <p className="text-xs text-muted-foreground">
                        Licensed Therapist
                      </p>
                    </div>
                    <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Verified
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-3 py-1.5">Trauma-informed care</span>
                    <span className="rounded-full bg-muted px-3 py-1.5">$80/session</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
