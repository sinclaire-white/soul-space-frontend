import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

const testimonials = [
  {
    id: "1",
    content:
      "Soul Space has been a lifeline for me. Being able to share my thoughts anonymously and receive support from both the community and professionals has made such a difference in my mental health journey.",
    author: "@hopeful_soul_42",
    role: "Community Member",
  },
  {
    id: "2",
    content:
      "As a therapist, I appreciate how Soul Space prioritizes professional verification while maintaining user anonymity. It&apos;s a unique platform that truly understands mental health needs.",
    author: "Dr. Sarah Chen",
    role: "Licensed Psychologist",
  },
  {
    id: "3",
    content:
      "The booking system is seamless, and I love that I can choose when to be completely anonymous versus using my nickname. It gives me control over my privacy.",
    author: "@quiet_warrior",
    role: "Community Member",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="fade-in" className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">What Our Community Says</h2>
          <p className="text-muted-foreground">
            Real stories from real people who have found support and healing through
            Soul Space.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll animation="slide-up" delay={0.15} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <Quote className="h-8 w-8 text-primary/20 mb-4 shrink-0" />
                <p className="text-muted-foreground flex-1">{testimonial.content}</p>
                <div className="flex items-center gap-3 mt-auto pt-6 border-t">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </AnimateOnScroll>
      </div>
    </section>
  );
}
