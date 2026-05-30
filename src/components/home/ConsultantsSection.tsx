"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { consultantsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

interface Consultant {
  id: string;
  professionalTitle: string;
  bio: string;
  hourlyRate: number;
  yearsExperience: number;
  averageRating: number | null;
  totalSessions: number;
  isAvailable: boolean;
  address?: string;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    age?: number | null;
    nickname?: {
      handle: string;
      avatarUrl?: string | null;
    } | null;
  };
}

export function ConsultantsSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-consultants"],
    queryFn: () =>
      consultantsApi.getAll({ page: 1, limit: 3, isAvailable: true }),
    select: (res) => {
      const result = res.data.data;
      if (Array.isArray(result)) {
        return result as Consultant[];
      }
      return (result?.consultants ?? []) as Consultant[];
    },
  });

  const consultants = useMemo(() => {
    if (!data) return [];
    return data.slice(0, 3);
  }, [data]);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="fade-in" className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Meet Our Consultants</h2>
            <p className="text-muted-foreground max-w-xl">
              Connect with verified mental health professionals who are ready to
              support you on your journey.
            </p>
          </div>
          <Link href="/consultants" className="mt-4 md:mt-0">
            <Button variant="outline" className="gap-2">
              View All Consultants
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </AnimateOnScroll>

        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
            Unable to load consultants right now. Please refresh the page.
          </div>
        ) : (
          <AnimateOnScroll animation="slide-up" delay={0.15} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading || consultants.length === 0 ? (
              [1, 2, 3].map((index) => (
                <Card key={index} className="animate-pulse h-80" />
              ))
            ) : (
              consultants.map((consultant) => (
                <Card key={consultant.id} className="group hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        {consultant.user.image ? (
                          <AvatarImage src={consultant.user.image} />
                        ) : consultant.user.nickname?.avatarUrl ? (
                          <AvatarImage src={consultant.user.nickname.avatarUrl} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {(consultant.user.name ?? consultant.user.nickname?.handle ?? "U")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{consultant.user.name ?? consultant.user.nickname?.handle ?? "Consultant"}</h3>
                          {consultant.averageRating !== null && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                              {consultant.averageRating.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{consultant.address || consultant.professionalTitle}</p>
                        {consultant.user.age != null ? (
                          <p className="text-xs text-muted-foreground mt-1">Age {consultant.user.age}</p>
                        ) : null}
                      </div>
                    </div>

                    {/* specializations removed from home section */}

                    <div className="flex items-center justify-between pt-4 border-t mt-auto">
                      <div>
                        {typeof consultant.hourlyRate === "number" && consultant.hourlyRate > 0 ? (
                          <>
                            {typeof consultant.hourlyRate === "number" ? (
                              <>
                                <span className="text-lg font-bold">{`$${consultant.hourlyRate}`}</span>
                                <span className="text-sm text-muted-foreground">/hr</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Contact for rates</span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Contact for rates</span>
                        )}
                      </div>
                      <Link href={`/consultants/${consultant.id}`}>
                        <Button size="sm">View Profile</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </AnimateOnScroll>
        )}
      </div>
    </section>
  );
}
