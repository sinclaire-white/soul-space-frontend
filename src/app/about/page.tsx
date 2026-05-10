import { Heart, Shield, Users, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Soul Space</h1>
          <p className="text-lg text-muted-foreground">
            A safe haven for mental health support and healing
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <p>
            Soul Space was born from a simple belief: everyone deserves access to mental
            health support in a safe, judgment-free environment. We understand that
            reaching out for help can be difficult, which is why we&apos;ve built a
            platform that prioritizes your privacy and anonymity above all else.
          </p>
          <p>
            Our platform bridges the gap between peer support and professional therapy,
            offering a unique space where you can share your thoughts anonymously,
            connect with others who understand, and access verified mental health
            professionals when you need them most.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Complete Anonymity</h3>
              <p className="text-muted-foreground">
                Your identity is never revealed. Interact through unique nicknames
                and share only what you&apos;re comfortable with.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verified Professionals</h3>
              <p className="text-muted-foreground">
                All consultants are licensed and verified mental health professionals
                ready to provide support.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Lock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                End-to-end encryption and strict privacy controls ensure your data
                is always protected.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Heart className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Support</h3>
              <p className="text-muted-foreground">
                Connect with a compassionate community that understands and supports
                your mental health journey.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            To make mental health support accessible to everyone, regardless of their
            circumstances. We believe that by providing a safe, anonymous space for
            sharing and healing, we can help reduce the stigma around mental health
            and support those who need it most.
          </p>
        </div>
      </div>
    </div>
  );
}
