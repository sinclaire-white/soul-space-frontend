"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { useAuth } from "@/hooks/useAuth";

export function CTASection() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="fade-in" className="max-w-3xl mx-auto text-center">
          <Heart className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Begin Your Healing Journey?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of others who have found support, understanding, and
            professional guidance on Soul Space. Your anonymous community awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/feed">
                <Button size="lg" variant="secondary" className="gap-2">
                  Go to Feed
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="gap-2">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/consultants">
              <Button size="lg" variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0">
                Browse Consultants
              </Button>
            </Link>
          </div>
          <p className="text-sm opacity-70 mt-6">
            No credit card required. Free to join the community.
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
