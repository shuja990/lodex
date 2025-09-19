import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  Star,
  ArrowRight,
  Package,
  Route,
  Shield,
  Target,
} from "lucide-react"

export default function ForShippersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              For Shippers
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Maximize Your Micro-Load Efficiency</h1>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              Reduce empty miles, increase efficiency, and ship small loads reliably with LodEx's verified carrier
              network.
            </p>
            <Button asChild size="lg">
              <Link href="/auth?type=shipper">
                Start Shipping Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Micro-Loads Matter */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Why Micro-Loads Matter</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Small shipments shouldn't mean big headaches or high costs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Reduce Empty Miles</h3>
                <p className="text-muted-foreground text-pretty">
                  Utilize carriers' unused capacity on existing routes, reducing waste and environmental impact.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Increase Efficiency</h3>
                <p className="text-muted-foreground text-pretty">
                  Get your small loads delivered faster without the overhead of traditional LTL shipping.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Reliable Delivery</h3>
                <p className="text-muted-foreground text-pretty">
                  Never worry about micro-loads getting left behind or delayed in traditional freight systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tips to Leverage LodEx */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Tips to Leverage LodEx</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Best practices to maximize your shipping efficiency and cost savings
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Post Loads Early</h3>
                  <p className="text-muted-foreground text-pretty">
                    Post your loads as early as possible to maximize carrier options and get better rates. Early posting
                    gives carriers more time to plan their routes around your shipment.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Package className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Combine Shipments</h3>
                  <p className="text-muted-foreground text-pretty">
                    When possible, combine multiple small shipments going to the same region for optimized routes and
                    better pricing. This creates win-win scenarios for both you and carriers.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Track Performance Metrics</h3>
                  <p className="text-muted-foreground text-pretty">
                    Monitor fulfillment rate, delivery times, and cost per mile to identify trends and optimize your
                    shipping strategy over time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Star className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Review Carrier Ratings</h3>
                  <p className="text-muted-foreground text-pretty">
                    Choose carriers with high ratings and positive reviews to ensure reliable service. Build
                    relationships with top-performing carriers for repeat business.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Performance Dashboard</h4>
                      <Badge variant="secondary">This Month</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">98%</div>
                        <div className="text-sm text-muted-foreground">Fulfillment Rate</div>
                      </div>
                      <div className="text-center p-4 bg-accent/5 rounded-lg">
                        <div className="text-2xl font-bold text-accent">1.2</div>
                        <div className="text-sm text-muted-foreground">Avg Days</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cost per Mile</span>
                        <span className="text-sm font-medium">$2.45</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Loads</span>
                        <span className="text-sm font-medium">47</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg Rating Given</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Success Stories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Real results from shippers who chose LodEx for their micro-load needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">35% Cost Reduction</h4>
                    <p className="text-sm text-muted-foreground">Manufacturing Company</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-pretty">
                  "Switching to LodEx for our small parts shipments reduced our logistics costs by 35% while improving
                  delivery times."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold">50% Faster Delivery</h4>
                    <p className="text-sm text-muted-foreground">E-commerce Retailer</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-pretty">
                  "Our urgent small shipments now arrive 50% faster than with traditional carriers, improving customer
                  satisfaction."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">99% Reliability</h4>
                    <p className="text-sm text-muted-foreground">Medical Supplies</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-pretty">
                  "Critical medical supplies reach their destination on time 99% of the time with LodEx's verified
                  carrier network."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features for Shippers */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Built for Shippers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Features designed to make your shipping process seamless and efficient
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Easy Load Posting</h3>
                <p className="text-muted-foreground text-pretty">
                  Post loads in minutes with our intuitive interface. Enter dimensions, weight, pickup/delivery details,
                  and get instant rate estimates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Route className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Smart Matching</h3>
                <p className="text-muted-foreground text-pretty">
                  Our algorithm matches your loads with carriers who have available capacity on routes that align with
                  your shipment needs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
                <p className="text-muted-foreground text-pretty">
                  Track performance metrics, view load history, and analyze cost savings with comprehensive reporting
                  tools.
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
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Optimize Your Shipping?</h2>
            <p className="text-xl opacity-90 text-pretty">
              Join thousands of shippers who have reduced costs and improved efficiency with LodEx.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth?type=shipper">
                  Start Shipping Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                <Link href="/post-load">Post Your First Load</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
