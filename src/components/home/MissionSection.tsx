import { Heart, Lightbulb, Target } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function MissionSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll animation="slide-up" className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Our Mission: Making Mental Health Support Accessible to Everyone
            </h2>
            <p className="text-muted-foreground text-lg">
              We believe that everyone deserves access to mental health support,
              regardless of their circumstances. Soul Space bridges the gap between
              peer support and professional therapy, creating a safe environment
              where healing can begin.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Compassion First</h3>
                  <p className="text-sm text-muted-foreground">
                    Every interaction is guided by empathy and understanding.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Evidence-Based</h3>
                  <p className="text-sm text-muted-foreground">
                    Our platform incorporates proven mental health practices.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Privacy Focused</h3>
                  <p className="text-sm text-muted-foreground">
                    Your anonymity is our top priority. We never compromise on privacy.
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
          
          <AnimateOnScroll animation="scale-in" delay={0.2} className="relative">
            <div className="aspect-square rounded-3xl bg-linear-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl font-bold text-primary mb-2">100%</div>
                <div className="text-xl font-medium mb-4">Anonymous</div>
                <p className="text-muted-foreground max-w-xs">
                  Your identity is always protected. Share freely without fear of judgment.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
