import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Users, ArrowRight, CheckCircle, Globe, Shield, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              About LodEx
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Our Mission</h1>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              LodEx™ exists to make micro-load shipping simple, reliable, and cost-efficient. We connect shippers with
              carriers who have unused capacity, reducing wasted miles and improving logistics for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground text-pretty leading-relaxed">
                  To revolutionize micro-load shipping by creating an efficient marketplace that connects shippers with
                  carriers, reducing empty miles, cutting costs, and improving delivery times for small shipments that
                  traditional logistics often overlook.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold">Our Vision</h2>
                </div>
                <p className="text-muted-foreground text-pretty leading-relaxed">
                  To become the leading platform for micro-load logistics, creating a sustainable transportation
                  ecosystem where every mile matters, every shipment finds its perfect carrier, and small businesses
                  have access to enterprise-level shipping solutions.
                </p>
              </div>
            </div>

            <div className="relative">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center">Impact by the Numbers</h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">500+</div>
                        <div className="text-sm text-muted-foreground">Active Carriers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-accent">1,200+</div>
                        <div className="text-sm text-muted-foreground">Loads Delivered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">35%</div>
                        <div className="text-sm text-muted-foreground">Cost Reduction</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-accent">98%</div>
                        <div className="text-sm text-muted-foreground">On-Time Rate</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              The principles that guide everything we do at LodEx
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Trust & Safety</h3>
                <p className="text-muted-foreground text-pretty">
                  Every carrier is thoroughly vetted and verified. Every shipper is authenticated. Safety and
                  reliability are non-negotiable.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Customer First</h3>
                <p className="text-muted-foreground text-pretty">
                  We prioritize the success of both shippers and carriers, creating win-win scenarios that benefit our
                  entire community.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Innovation</h3>
                <p className="text-muted-foreground text-pretty">
                  We continuously improve our platform with cutting-edge technology to make logistics simpler and more
                  efficient.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Globe className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Sustainability</h3>
                <p className="text-muted-foreground text-pretty">
                  By reducing empty miles and optimizing routes, we contribute to a more sustainable transportation
                  ecosystem.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Community</h3>
                <p className="text-muted-foreground text-pretty">
                  We're building more than a platform—we're creating a community of logistics professionals who support
                  each other.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Transparency</h3>
                <p className="text-muted-foreground text-pretty">
                  Clear pricing, honest communication, and transparent processes. No hidden fees, no surprises, just
                  reliable service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">The Problem We Solve</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Traditional logistics fails micro-loads, and we're here to change that
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">For Shippers</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-accent rounded-full mt-2" />
                    <p className="text-muted-foreground text-pretty">
                      Small shipments get deprioritized by traditional carriers
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-accent rounded-full mt-2" />
                    <p className="text-muted-foreground text-pretty">
                      Minimum weight requirements make micro-loads expensive
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-accent rounded-full mt-2" />
                    <p className="text-muted-foreground text-pretty">Hub-and-spoke systems add unnecessary delays</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-accent rounded-full mt-2" />
                    <p className="text-muted-foreground text-pretty">
                      Limited visibility and tracking for small shipments
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">For Carriers</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                    <p className="text-muted-foreground text-pretty">
                      Unused capacity on existing routes goes to waste
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                    <p className="text-muted-foreground text-pretty">
                      Difficulty finding small loads that fit their routes
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                    <p className="text-muted-foreground text-pretty">Limited opportunities to monetize partial loads</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                    <p className="text-muted-foreground text-pretty">
                      Complex processes to find and secure additional freight
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center">The LodEx Solution</h3>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Direct shipper-to-carrier matching</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">No minimum weight requirements</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Real-time tracking and communication</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Optimized route utilization</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Transparent, competitive pricing</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Verified network of professionals</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Built by Logistics Experts</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Our team combines decades of logistics experience with cutting-edge technology
            </p>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              LodEx was founded by a team of logistics professionals who experienced firsthand the challenges of
              micro-load shipping. After years of watching small shipments get delayed, overcharged, or simply rejected
              by traditional carriers, we decided to build a better solution.
            </p>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Our diverse team includes former freight brokers, transportation managers, software engineers, and
              customer success specialists—all united by the mission to make logistics work better for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-primary-foreground space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Join Our Mission</h2>
            <p className="text-xl opacity-90 text-pretty">
              Be part of the logistics revolution. Help us create a more efficient, sustainable transportation
              ecosystem.
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
