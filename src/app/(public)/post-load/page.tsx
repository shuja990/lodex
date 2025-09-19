import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, DollarSign, BarChart3, ArrowRight, CheckCircle, Truck, Shield, Star } from "lucide-react"

export default function PostLoadPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              Shipper Portal
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Post Your Micro-Load in Minutes</h1>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              Get your small shipments delivered quickly and efficiently with our verified carrier network.
            </p>
            <Button asChild size="lg">
              <Link href="/auth?type=shipper">
                Post Your First Load
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Comprehensive tools to manage your micro-load shipments from start to finish
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Easy Load Entry</h3>
                <p className="text-muted-foreground text-pretty">
                  Enter load details: origin, destination, dimensions, weight, pickup/delivery dates with our intuitive
                  form.
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
                  Track status: Pending → Accepted → In Transit → Delivered with live GPS updates and notifications.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Transparent Pricing</h3>
                <p className="text-muted-foreground text-pretty">
                  Estimated fee display before posting with secure payment via dashboard: card/ACH with receipts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Load History & Analytics</h3>
                <p className="text-muted-foreground text-pretty">
                  View load history, analytics, and ratings of carriers to make informed decisions for future shipments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Verified Carriers</h3>
                <p className="text-muted-foreground text-pretty">
                  All carriers are thoroughly vetted with proper licensing, insurance, and background checks for your
                  peace of mind.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Rating System</h3>
                <p className="text-muted-foreground text-pretty">
                  Rate and review carriers after delivery to help build a trusted community of reliable logistics
                  partners.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Simple Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              From posting to delivery in just a few easy steps
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Post Your Load</h3>
                  <p className="text-muted-foreground text-pretty">
                    Fill out the simple form with your shipment details, pickup and delivery locations, and preferred
                    timing.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Get Matched</h3>
                  <p className="text-muted-foreground text-pretty">
                    Our algorithm instantly matches your load with verified carriers who have capacity on your route.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Track & Receive</h3>
                  <p className="text-muted-foreground text-pretty">
                    Monitor your shipment in real-time and receive notifications when it's picked up and delivered.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Load Details</h4>
                      <Badge variant="secondary">Ready to Post</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Origin</span>
                        <span className="text-sm font-medium">Chicago, IL</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Destination</span>
                        <span className="text-sm font-medium">Detroit, MI</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Weight</span>
                        <span className="text-sm font-medium">75 lbs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Dimensions</span>
                        <span className="text-sm font-medium">24" x 18" x 12"</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pickup Date</span>
                        <span className="text-sm font-medium">Tomorrow 2PM</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Estimated Cost</span>
                        <span className="text-lg font-bold text-accent">$185</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Why Choose LodEx?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Advantages that make us the preferred choice for micro-load shipping
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Faster Than Traditional LTL</h3>
                  <p className="text-muted-foreground text-pretty">
                    Skip the hub-and-spoke delays. Your micro-loads travel directly with carriers on their planned
                    routes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cost-Effective Pricing</h3>
                  <p className="text-muted-foreground text-pretty">
                    Pay competitive rates without minimum weight requirements or oversized fees that traditional
                    carriers impose.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Personal Service</h3>
                  <p className="text-muted-foreground text-pretty">
                    Work directly with individual carriers who care about your shipment and provide personalized
                    service.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Complete Visibility</h3>
                  <p className="text-muted-foreground text-pretty">
                    Track your shipment from pickup to delivery with real-time GPS updates and carrier communication.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Recent Deliveries</h4>
                      <Badge variant="secondary">This Week</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-accent/5 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Chicago → Detroit</div>
                          <div className="text-xs text-muted-foreground">Delivered 2 hours early</div>
                        </div>
                        <div className="text-sm font-medium">$185</div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-accent/5 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Milwaukee → Cleveland</div>
                          <div className="text-xs text-muted-foreground">Perfect condition</div>
                        </div>
                        <div className="text-sm font-medium">$220</div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                        <Truck className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Indianapolis → Columbus</div>
                          <div className="text-xs text-muted-foreground">In transit - ETA 3 hours</div>
                        </div>
                        <div className="text-sm font-medium">$165</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-primary-foreground space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Ship Your First Load?</h2>
            <p className="text-xl opacity-90 text-pretty">
              Join thousands of shippers who trust LodEx for their micro-load shipping needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth?type=shipper">
                  Post a Load Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                <Link href="/how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
