import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, MapPin, Clock, Shield, Star, ArrowRight, CheckCircle, Users, Package, Route } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Fast, Reliable Micro-Load Shipping
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                  LodEx™: Connect. Ship. Track.
                </h1>
                <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                  Connect with verified carriers, post micro-loads instantly, and track every delivery from start to
                  finish.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/auth?type=shipper">
                    Post a Load
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                  <Link href="/auth?type=carrier">Join as a Carrier</Link>
                </Button>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">Trusted by logistics professionals</p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <span className="ml-2 text-sm font-medium">4.9/5</span>
                  </div>
                  <div className="text-sm text-muted-foreground">500+ Active Carriers</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 rounded-2xl" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-accent rounded-lg flex items-center justify-center">
                        <Truck className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Live Tracking</h3>
                        <p className="text-sm opacity-90">Real-time updates</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-accent text-accent-foreground">
                      In Transit
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-accent" />
                      <span className="text-sm">Load picked up - Chicago, IL</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-accent" />
                      <span className="text-sm">En route - Indianapolis, IN</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 opacity-60" />
                      <span className="text-sm opacity-90">ETA: 2 hours - Detroit, MI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supporting Copy */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold text-balance">Efficient Micro-Load Solutions</h2>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              LodEx helps you move small shipments efficiently by connecting you with drivers who have unused capacity
              along their planned routes.
            </p>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Save time, reduce costs, and never worry about micro-loads getting left behind.
            </p>
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">How LodEx Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Simple, efficient process from posting to delivery
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Shipper Posts</h3>
              <p className="text-muted-foreground text-pretty">Post your micro-load with pickup and delivery details</p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-accent rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold">LodEx Matches</h3>
              <p className="text-muted-foreground text-pretty">
                Our platform connects you with verified carriers on your route
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                <Route className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Carrier Delivers</h3>
              <p className="text-muted-foreground text-pretty">Professional drivers handle your shipment with care</p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-accent rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Track & Pay</h3>
              <p className="text-muted-foreground text-pretty">Real-time tracking with secure payment upon delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Why Choose LodEx?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Built for modern logistics with reliability at its core
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Verified Carriers</h3>
                <p className="text-muted-foreground text-pretty">
                  All carriers are thoroughly vetted with proper licensing, insurance, and background checks.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Real-Time Tracking</h3>
                <p className="text-muted-foreground text-pretty">
                  Monitor your shipments from pickup to delivery with live GPS tracking and status updates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Fast Matching</h3>
                <p className="text-muted-foreground text-pretty">
                  Get matched with available carriers in minutes, not hours or days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-center text-primary-foreground">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Ship Smarter?</h2>
              <p className="text-xl opacity-90 text-pretty">
                Join thousands of shippers and carriers who trust LodEx for their micro-load needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                  <Link href="/auth?type=shipper">
                    Get Started as Shipper
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                >
                  <Link href="/auth?type=carrier">Join as Carrier</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Truck className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">LodEx™</span>
              </div>
              <p className="text-muted-foreground text-pretty">
                Fast, reliable micro-load shipping for modern logistics.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Platform</h4>
              <div className="space-y-2">
                <Link
                  href="/how-it-works"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </Link>
                <Link href="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="/download" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Download App
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">For Users</h4>
              <div className="space-y-2">
                <Link
                  href="/for-shippers"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  For Shippers
                </Link>
                <Link
                  href="/for-carriers"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  For Carriers
                </Link>
                <Link href="/post-load" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Post a Load
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 LodEx™. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
