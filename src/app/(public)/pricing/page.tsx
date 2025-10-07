import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Users, TrendingDown, CheckCircle, Percent, CreditCard } from "lucide-react"
import { SmartCTAButton } from "@/components/smart-cta-button"

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              MVP Pricing
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              During MVP, posting is free. Pay only when your load is fulfilled.
            </p>
          </div>
        </div>
      </section>

      {/* MVP Phase */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">MVP Phase Benefits</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Get started with LodEx at no upfront cost during our MVP phase
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Gift className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Free Load Posting</h3>
                  <p className="text-muted-foreground text-pretty">
                    Post unlimited loads during our MVP phase at no cost. No subscription fees, no posting charges.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Percent className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Pay Only When Delivered</h3>
                  <p className="text-muted-foreground text-pretty">
                    ~15% of load value after successful delivery. No hidden fees, no upfront costs.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Flexible Payment Options</h3>
                  <p className="text-muted-foreground text-pretty">
                    Pay via credit card, ACH transfer, or set up corporate accounts for streamlined billing.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">MVP Pricing</h3>
                      <Badge variant="secondary">Limited Time</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-accent">FREE</div>
                        <div className="text-sm text-muted-foreground">Load Posting</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">~15%</div>
                        <div className="text-sm text-muted-foreground">of load value after delivery</div>
                      </div>
                    </div>

                    <div className="space-y-3 text-left">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Unlimited load posting</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Real-time tracking</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">Verified carrier network</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-sm">24/7 customer support</span>
                      </div>
                    </div>

                    <SmartCTAButton
                      defaultText="Start Shipping Free"
                      shipperText="Go to Dashboard"
                      carrierText="Browse Available Loads"
                      defaultHref="/auth?type=shipper"
                      shipperHref="/dashboard/shipper"
                      carrierHref="/dashboard/carrier/loads"
                      size="lg"
                      className="w-full"
                      targetRole="shipper"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Incentives */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Early Adopter Incentives</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Special rewards for joining LodEx during our MVP phase
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Gift className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">First Load Credits</h3>
                <p className="text-muted-foreground text-pretty">
                  Get $50 in credits when you complete your first successful shipment during the MVP phase.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Referral Rewards</h3>
                <p className="text-muted-foreground text-pretty">
                  Earn $25 for each new shipper you refer who completes their first load on the platform.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Volume Discounts</h3>
                <p className="text-muted-foreground text-pretty">
                  Frequent shippers get reduced rates: 10+ loads/month = 12%, 25+ loads/month = 10%.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Cost Comparison</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              See how LodEx compares to traditional shipping methods
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Traditional LTL</h3>
                  <div className="text-2xl font-bold text-muted-foreground">$250-400</div>
                  <p className="text-sm text-muted-foreground">Chicago to Detroit (75 lbs)</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Base Rate</span>
                    <span>$180</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Fuel Surcharge</span>
                    <span>$35</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Minimum Weight Fee</span>
                    <span>$45</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Accessorial Charges</span>
                    <span>$25</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="secondary">Best Value</Badge>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">LodEx</h3>
                  <div className="text-2xl font-bold text-accent">$185</div>
                  <p className="text-sm text-muted-foreground">Chicago to Detroit (75 lbs)</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Carrier Rate</span>
                    <span>$160</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Platform Fee (15%)</span>
                    <span>$25</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-accent">
                    <span>No Hidden Fees</span>
                    <span>$0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-accent">
                    <span>No Minimums</span>
                    <span>$0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Expedited Service</h3>
                  <div className="text-2xl font-bold text-muted-foreground">$400-600</div>
                  <p className="text-sm text-muted-foreground">Chicago to Detroit (75 lbs)</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Base Rate</span>
                    <span>$280</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Expedite Fee</span>
                    <span>$150</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Fuel Surcharge</span>
                    <span>$45</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Additional Fees</span>
                    <span>$35</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Pricing FAQ</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Common questions about our pricing structure
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">When do I pay?</h3>
                <p className="text-muted-foreground text-pretty">
                  Payment is only charged after successful delivery of your load. No upfront costs or posting fees
                  during MVP.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">What if my load isn't delivered?</h3>
                <p className="text-muted-foreground text-pretty">
                  If your load isn't successfully delivered, you don't pay anything. Our fee is only charged upon
                  completion.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Are there any hidden fees?</h3>
                <p className="text-muted-foreground text-pretty">
                  No hidden fees. The 15% platform fee includes all services: matching, tracking, payment processing,
                  and support.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">How do volume discounts work?</h3>
                <p className="text-muted-foreground text-pretty">
                  Ship 10+ loads per month for 12% fee, or 25+ loads for 10% fee. Discounts apply automatically to
                  qualifying accounts.
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
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Save on Shipping?</h2>
            <p className="text-xl opacity-90 text-pretty">
              Start with free load posting and pay only when your shipments are delivered successfully.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <SmartCTAButton
                defaultText="Post Your First Load"
                shipperText="Post a Load"
                carrierText="Browse Available Loads"
                defaultHref="/auth?type=shipper"
                shipperHref="/dashboard/shipper/post-load"
                carrierHref="/dashboard/carrier/loads"
                variant="secondary"
                size="lg"
                targetRole="shipper"
              />
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                <Link href="/how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
