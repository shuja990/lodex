import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MessageCircle, Clock, ArrowRight, Send, HelpCircle, Users, Truck } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              Contact & Support
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">We're Here to Help</h1>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              Have questions about LodEx? Need support with your shipments? Our team is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Get in Touch</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Choose the best way to reach us based on your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Email Support</h3>
                <p className="text-muted-foreground text-pretty">
                  For general inquiries, account questions, or detailed support requests.
                </p>
                <Button asChild variant="outline">
                  <Link href="mailto:support@lodex.com">support@lodex.com</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Phone className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Phone Support</h3>
                <p className="text-muted-foreground text-pretty">
                  For urgent issues or when you need immediate assistance with active shipments.
                </p>
                <Button asChild variant="outline">
                  <Link href="tel:+1-800-LODEX-99">1-800-LODEX-99</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Live Chat</h3>
                <p className="text-muted-foreground text-pretty">
                  Quick questions or real-time support while using the platform.
                </p>
                <Button asChild>
                  <Link href="/auth">
                    Start Chat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-balance">Send Us a Message</h2>
                <p className="text-lg text-muted-foreground text-pretty">
                  Fill out the form and we'll get back to you within 24 hours.
                </p>
              </div>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@company.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company (Optional)</Label>
                      <Input id="company" placeholder="Your Company Name" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userType">I am a...</Label>
                      <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
                        <option value="">Select your role</option>
                        <option value="shipper">Shipper</option>
                        <option value="carrier">Carrier</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help you?" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please describe your question or issue in detail..."
                        rows={5}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Support Hours</h3>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Monday - Friday</div>
                        <div className="text-sm text-muted-foreground">8:00 AM - 8:00 PM EST</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Saturday</div>
                        <div className="text-sm text-muted-foreground">9:00 AM - 5:00 PM EST</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-muted-foreground">Sunday</div>
                        <div className="text-sm text-muted-foreground">Closed (Emergency support available)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Common Questions</h3>
                <div className="space-y-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <HelpCircle className="h-5 w-5 text-accent mt-0.5" />
                        <div>
                          <div className="font-medium">How do I track my shipment?</div>
                          <div className="text-sm text-muted-foreground">
                            Log into your account and visit the "My Loads" section for real-time tracking.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <HelpCircle className="h-5 w-5 text-accent mt-0.5" />
                        <div>
                          <div className="font-medium">What if my load is damaged?</div>
                          <div className="text-sm text-muted-foreground">
                            Contact us immediately. All shipments are covered by carrier insurance.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <HelpCircle className="h-5 w-5 text-accent mt-0.5" />
                        <div>
                          <div className="font-medium">How do I become a verified carrier?</div>
                          <div className="text-sm text-muted-foreground">
                            Sign up and complete our verification process with your license and insurance docs.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Quick Links</h3>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                    <Link href="/how-it-works">
                      <Users className="mr-2 h-4 w-4" />
                      How It Works
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                    <Link href="/pricing">
                      <Truck className="mr-2 h-4 w-4" />
                      Pricing Information
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                    <Link href="/auth">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Create Account
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-accent/20 bg-accent/5">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Phone className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold text-accent">Emergency Support</h3>
                <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                  For urgent issues with active shipments outside business hours, call our emergency line.
                </p>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                >
                  <Link href="tel:+1-800-EMERGENCY">1-800-EMERGENCY</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
