import { Card, CardContent } from "@/components/ui/card";
import { Shield, MessageCircle, Users, Calendar, Heart, Lock } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

const features = [
  {
    icon: Shield,
    title: "Complete Anonymity",
    description:
      "Interact via unique nicknames. Your real identity is never revealed, ensuring complete privacy.",
  },
  {
    icon: MessageCircle,
    title: "Supportive Community",
    description:
      "Share your thoughts with people who understand. Get support through mental-health-appropriate reactions.",
  },
  {
    icon: Users,
    title: "Verified Consultants",
    description:
      "Connect with licensed mental health professionals. Their responses are prioritized and clearly marked.",
  },
  {
    icon: Calendar,
    title: "Easy Booking",
    description:
      "Book therapy sessions seamlessly. View availability, schedule appointments, and manage everything in one place.",
  },
  {
    icon: Heart,
    title: "Mental Health First",
    description:
      "Designed specifically for those experiencing depression, anxiety, and emotional distress with safety in mind.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description:
      "End-to-end encryption for sensitive data. Your information is protected with industry-leading security.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimateOnScroll animation="fade-in" className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Soul Space?</h2>
          <p className="text-muted-foreground">
            We&apos;ve built a platform that prioritizes your privacy, safety, and
            mental well-being above everything else.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll animation="slide-up" delay={0.15} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </AnimateOnScroll>
      </div>
    </section>
  );
}
