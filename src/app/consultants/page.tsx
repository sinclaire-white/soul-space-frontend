"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { consultantsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// specializations removed from listing and filters
import { Star, Search, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";

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
    name?: string | null;
    image?: string | null;
    age?: number | null;
    nickname?: {
      handle: string;
      avatarUrl?: string | null;
    } | null;
  };
}


const ANY_PRICE_VALUE = "any-price";

export default function ConsultantsPage() {
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<string>(ANY_PRICE_VALUE);

  const {
    data: consultantsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["consultants", maxPrice],
    queryFn: () =>
      consultantsApi.getAll({
        page: 1,
        limit: 20,
        maxPrice:
          maxPrice !== ANY_PRICE_VALUE ? parseInt(maxPrice, 10) : undefined,
      }),
    select: (res) => res.data.data,
    placeholderData: keepPreviousData,
  });

  const consultants = useMemo(() => {
    if (Array.isArray(consultantsData)) {
      return consultantsData as Consultant[];
    }

    return (consultantsData?.consultants ?? []) as Consultant[];
  }, [consultantsData]);

  const filteredConsultants = consultants.filter(
    (consultant: Consultant) =>
      search === "" ||
      (consultant.user.name ?? consultant.user.nickname?.handle ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      consultant.professionalTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find a Consultant</h1>
          <p className="text-muted-foreground">
            Connect with verified mental health professionals who can support you
            on your journey.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* specialization filter removed */}
              <Select value={maxPrice} onValueChange={setMaxPrice}>
                <SelectTrigger>
                  <SelectValue placeholder="Max Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_PRICE_VALUE}>Any Price</SelectItem>
                  <SelectItem value="50">Under $50</SelectItem>
                  <SelectItem value="100">Under $100</SelectItem>
                  <SelectItem value="150">Under $150</SelectItem>
                  <SelectItem value="200">Under $200</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredConsultants.length} consultant{filteredConsultants.length === 1 ? "" : "s"} found
              </span>
              {isFetching && !isLoading ? (
                <span className="animate-pulse font-medium text-foreground/70">
                  Updating results...
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Consultants Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden border-border/60">
                <CardContent className="space-y-5 pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-4/6 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Couldn&apos;t load consultants</h2>
                <p className="text-sm text-muted-foreground">
                  Please try again. If the problem persists, refresh the page.
                </p>
              </div>
              <Button onClick={() => void refetch()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultants?.map((consultant: Consultant) => (
              <Card key={consultant.id} className="flex flex-col h-full">
                <CardContent className="pt-6 flex-1 flex flex-col">
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
                      <h3 className="font-semibold">{consultant.user.name ?? consultant.user.nickname?.handle ?? "Consultant"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {consultant.professionalTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {consultant.averageRating && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                            {consultant.averageRating.toFixed(1)}
                          </Badge>
                        )}
                        {consultant.isAvailable ? (
                          <Badge variant="default" className="text-xs bg-green-600">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {consultant.address || consultant.bio || "Licensed mental health professional"}
                  </p>

                  {/* specializations removed from public listing */}

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between text-sm mt-auto">
                      <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {typeof consultant.hourlyRate === "number" ? (
                          <>{`$${consultant.hourlyRate}/hr`}</>
                        ) : (
                          <span className="text-muted-foreground">Contact for rates</span>
                        )}
                      </span>
                      {consultant.user.age != null ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Age {consultant.user.age}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Link href={`/consultants/${consultant.id}`}>
                    <Button className="w-full">View Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !isError && filteredConsultants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No consultants found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
