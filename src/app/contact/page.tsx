"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Message sent successfully! We'll get back to you soon.");
    setIsSubmitting(false);
    
    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            We&apos;re here to help. Reach out to us with any questions or concerns.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-sm text-muted-foreground">support@soulspace.com</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Available 24/7</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Crisis Line</h3>
              <p className="text-sm text-muted-foreground">988 Suicide & Crisis Lifeline</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
