import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  Package,
  Search,
  MapPin,
  CreditCard,
  Star,
  CheckCircle,
  ArrowRight,
  Truck,
  Route,
  Shield,
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              Simple Process
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Shipping Made Simple for Micro-Loads</h1>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              LodEx connects shippers with verified carriers through a streamlined process that saves time and reduces
              costs.
            </p>
          </div>
        </div>
      </section>

      {/* For Shippers Process */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">For Shippers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Post your micro-loads and get them delivered efficiently
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-primary" />
                    Sign Up / Sign In
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Register on the website or app with verification (MC number, insurance).
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Package className="h-5 w-5 mr-2 text-primary" />
                    Post Your Load
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Enter origin, destination, dimensions, weight, and pickup/delivery dates.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Search className="h-5 w-5 mr-2 text-primary" />
                    Carrier Matching
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Verified carriers along your route are suggested automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  4
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    Track Shipment
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Monitor load from acceptance → in transit → delivered with real-time updates.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  5
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    Payment
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Pay per-fulfilled-load via dashboard; options for card, ACH, or corporate account.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  6
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Star className="h-5 w-5 mr-2 text-primary" />
                    Rate & Review
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    After delivery, rate the carrier and leave feedback to help the community.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Load #LX-2024-001</h4>
                      <Badge variant="secondary">In Transit</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Posted - Chicago, IL</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Matched with carrier</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Picked up - Chicago, IL</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm">En route - Indianapolis, IN</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                        <span className="text-sm text-muted-foreground">ETA: 2 hours - Detroit, MI</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/auth?type=shipper">
                Get Started as Shipper
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Carriers Process */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">For Carriers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Earn extra income by utilizing your unused capacity
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative order-2 lg:order-1">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Available Loads</h4>
                      <Badge variant="outline">3 matches</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Chicago → Detroit</span>
                          <span className="text-accent font-semibold">$180</span>
                        </div>
                        <div className="text-sm text-muted-foreground">50 lbs • Pickup: Today 2PM</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Milwaukee → Cleveland</span>
                          <span className="text-accent font-semibold">$220</span>
                        </div>
                        <div className="text-sm text-muted-foreground">75 lbs • Pickup: Tomorrow 9AM</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8 order-1 lg:order-2">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-accent" />
                    Sign Up / Sign In
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Register with verification (driver's license, vehicle info, selfie photo).
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Search className="h-5 w-5 mr-2 text-accent" />
                    Receive Load Offers
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Automated matching based on route, capacity, and availability.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-accent" />
                    Accept / Decline Loads
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Choose loads that fit your schedule and route preferences.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                  4
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Route className="h-5 w-5 mr-2 text-accent" />
                    Route Optimization
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Optional suggestions for efficient travel and fuel savings.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                  5
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-accent" />
                    Delivery & Confirmation
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Update status; delivery triggers automatic notification to shippers.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                  6
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-accent" />
                    Payment & Ratings
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    Receive payment via dashboard and rate the shipper experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth?type=carrier">
                Join as Carrier
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Visual Process Flow */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">The Complete Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              From registration to delivery, every step is designed for efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Registration</h3>
                <p className="text-muted-foreground text-pretty">
                  Secure verification process for both shippers and carriers
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Matching</h3>
                <p className="text-muted-foreground text-pretty">
                  AI-powered matching based on routes, capacity, and preferences
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Tracking</h3>
                <p className="text-muted-foreground text-pretty">
                  Real-time GPS tracking and status updates throughout delivery
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Rating</h3>
                <p className="text-muted-foreground text-pretty">
                  Mutual rating system builds trust and improves service quality
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-primary-foreground space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Get Started?</h2>
            <p className="text-xl opacity-90 text-pretty">
              Join the LodEx platform and experience efficient micro-load shipping today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth?type=shipper">
                  Start Shipping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                <Link href="/auth?type=carrier">Become a Carrier</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
