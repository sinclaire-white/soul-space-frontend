import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

const featuredConsultants = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    title: "Licensed Clinical Psychologist",
    specializations: ["Anxiety", "Depression", "Trauma"],
    rating: 4.9,
    reviews: 128,
    yearsExperience: 12,
    price: 120,
  },
  {
    id: "2",
    name: "Dr. Michael Torres",
    title: "Psychiatrist",
    specializations: ["Bipolar Disorder", "ADHD", "OCD"],
    rating: 4.8,
    reviews: 96,
    yearsExperience: 15,
    price: 150,
  },
  {
    id: "3",
    name: "Dr. Emily Watson",
    title: "Licensed Therapist",
    specializations: ["Relationships", "Grief", "Self-Esteem"],
    rating: 5.0,
    reviews: 84,
    yearsExperience: 8,
    price: 100,
  },
];

export function ConsultantsSection() {
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

        <AnimateOnScroll animation="slide-up" delay={0.15} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredConsultants.map((consultant) => (
            <Card key={consultant.id} className="group hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {consultant.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{consultant.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                        {consultant.rating}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{consultant.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {consultant.yearsExperience} years experience
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {consultant.specializations.map((spec) => (
                    <Badge key={spec} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                  <div>
                    <span className="text-lg font-bold">${consultant.price}</span>
                    <span className="text-sm text-muted-foreground">/session</span>
                  </div>
                  <Link href={`/consultants/${consultant.id}`}>
                    <Button size="sm">Book Now</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </AnimateOnScroll>
      </div>
    </section>
  );
}
