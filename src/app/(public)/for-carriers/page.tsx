import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Star,
  Gift,
  Route,
  Shield,
  Users,
  CheckCircle,
} from "lucide-react"
import { SmartCTAButton } from "@/components/smart-cta-button"

export default function ForCarriersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-accent/5 via-background to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              For Carriers
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Earn More on Your Routes</h1>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              Maximize your vehicle utilization and earn extra income by carrying micro-loads along your planned routes.
            </p>
            <SmartCTAButton
              defaultText="Join as Carrier"
              shipperText="Post a Load"
              carrierText="Go to Dashboard"
              defaultHref="/auth?type=carrier"
              shipperHref="/dashboard/shipper/post-load"
              carrierHref="/dashboard/carrier"
              variant="secondary"
              size="lg"
              targetRole="carrier"
            />
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Why Join LodEx?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Turn your unused capacity into additional revenue with flexible opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Flexible Schedules</h3>
                <p className="text-muted-foreground text-pretty">
                  Choose loads that fit your existing routes and schedule. No commitment to full-time hauling required.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Optimize Vehicle Usage</h3>
                <p className="text-muted-foreground text-pretty">
                  Make the most of your vehicle's capacity by filling unused space with profitable micro-loads.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Earn Extra Income</h3>
                <p className="text-muted-foreground text-pretty">
                  Generate additional revenue from space that would otherwise go unused on your regular routes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Getting Started</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Simple steps to start earning with LodEx
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Register Your Profile</h3>
                  <p className="text-muted-foreground text-pretty">
                    Complete our verification process with your driver's license, vehicle information, and insurance
                    details. We ensure all carriers meet our safety standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Complete Verification</h3>
                  <p className="text-muted-foreground text-pretty">
                    Our team reviews your documents and conducts background checks to maintain the highest safety
                    standards for all platform users.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Start Accepting Micro-Loads</h3>
                  <p className="text-muted-foreground text-pretty">
                    Once verified, you'll receive load offers that match your routes and capacity. Accept the ones that
                    work for your schedule.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Carrier Profile</h4>
                      <Badge variant="secondary">Verified</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Driver's License Verified</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Insurance Documentation</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Vehicle Information</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Background Check</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rating</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="text-sm font-medium">5.0</span>
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

      {/* Incentives */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Carrier Incentives</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              We reward our best carriers with bonuses and benefits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Gift className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">First-Load Credits</h3>
                <p className="text-muted-foreground text-pretty">
                  Earn bonus credits for completing your first successful delivery. Get started with extra incentives.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Referral Rewards</h3>
                <p className="text-muted-foreground text-pretty">
                  Refer other qualified carriers and earn rewards for each successful referral who completes their first
                  load.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Route className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Route Optimization</h3>
                <p className="text-muted-foreground text-pretty">
                  Get intelligent route suggestions to maximize efficiency and fuel savings while carrying multiple
                  loads.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ratings System */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Build Your Reputation</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Our rating system helps you build trust and earn more opportunities
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Verified Shippers</h3>
                  <p className="text-muted-foreground text-pretty">
                    Work with verified shippers who have been vetted for legitimacy and payment reliability.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Star className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Mutual Ratings</h3>
                  <p className="text-muted-foreground text-pretty">
                    Rate shippers after each delivery and receive ratings that build your reputation on the platform.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Performance Tracking</h3>
                  <p className="text-muted-foreground text-pretty">
                    Track your delivery performance, on-time rates, and customer satisfaction to improve your service.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Performance Stats</h4>
                      <Badge variant="secondary">This Month</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-accent/5 rounded-lg">
                        <div className="text-2xl font-bold text-accent">24</div>
                        <div className="text-sm text-muted-foreground">Loads Completed</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">100%</div>
                        <div className="text-sm text-muted-foreground">On-Time Rate</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Rating</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="text-sm font-medium">4.9</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Earnings</span>
                        <span className="text-sm font-medium">$2,840</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Miles Driven</span>
                        <span className="text-sm font-medium">1,250</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Potential */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Earnings Potential</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              See how much you could earn by utilizing your unused capacity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="text-3xl font-bold text-accent">$150-300</div>
                <h3 className="text-xl font-semibold">Per Week</h3>
                <p className="text-muted-foreground text-pretty">
                  Part-time carriers earning extra income on existing routes
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="text-3xl font-bold text-primary">$500-800</div>
                <h3 className="text-xl font-semibold">Per Week</h3>
                <p className="text-muted-foreground text-pretty">
                  Active carriers taking multiple loads along their routes
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="text-3xl font-bold text-accent">$1000+</div>
                <h3 className="text-xl font-semibold">Per Week</h3>
                <p className="text-muted-foreground text-pretty">
                  Dedicated carriers optimizing routes for maximum load capacity
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent to-accent/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-accent-foreground space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Start Earning?</h2>
            <p className="text-xl opacity-90 text-pretty">
              Join thousands of carriers who are maximizing their earning potential with LodEx.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <SmartCTAButton
                defaultText="Sign Up as Carrier"
                shipperText="Post a Load"
                carrierText="Browse Available Loads"
                defaultHref="/auth?type=carrier"
                shipperHref="/dashboard/shipper/post-load"
                carrierHref="/dashboard/carrier/loads"
                variant="secondary"
                size="lg"
                targetRole="carrier"
              />
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground hover:text-accent bg-transparent"
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
