import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Download, Star, Shield, Zap, Users, CheckCircle } from "lucide-react"

export default function DownloadPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit">
                Mobile App
              </Badge>
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-balance">LodEx On-the-Go</h1>
                <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                  Manage your shipments, track loads, and connect with carriers anywhere, anytime. The full power of
                  LodEx in your pocket.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="flex-1">
                  <Link href="/auth">
                    <Download className="mr-2 h-5 w-5" />
                    Download for iOS
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="flex-1 bg-transparent">
                  <Link href="/auth">
                    <Download className="mr-2 h-5 w-5" />
                    Download for Android
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>50K+ Downloads</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto w-64 h-96 bg-gradient-to-br from-primary to-accent rounded-3xl p-2 shadow-2xl">
                <div className="w-full h-full bg-background rounded-2xl overflow-hidden">
                  <Image
                    src="/mobile-app-interface-showing-logistics-dashboard-w.jpg"
                    alt="LodEx Mobile App Interface"
                    width={250}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              All the features you love from our web platform, optimized for mobile
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Real-Time Tracking</h3>
                <p className="text-muted-foreground text-pretty">
                  Track your shipments in real-time with GPS updates and delivery notifications.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Instant Booking</h3>
                <p className="text-muted-foreground text-pretty">
                  Book carriers instantly with our smart matching algorithm and instant quotes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Secure Payments</h3>
                <p className="text-muted-foreground text-pretty">
                  Handle all payments securely through the app with automatic invoicing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Direct Messaging</h3>
                <p className="text-muted-foreground text-pretty">
                  Communicate directly with carriers and shippers through in-app messaging.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Load Management</h3>
                <p className="text-muted-foreground text-pretty">
                  Post, edit, and manage all your loads from anywhere with full mobile functionality.
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
                  Rate and review carriers, build your reputation, and find trusted partners.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">See It In Action</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Take a look at the clean, intuitive interface designed for logistics professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-48 h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-1">
                <div className="w-full h-full bg-background rounded-xl overflow-hidden">
                  <Image
                    src="/mobile-dashboard-showing-load-listings-with-blue-a.jpg"
                    alt="Dashboard Screen"
                    width={180}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold">Dashboard</h3>
              <p className="text-sm text-muted-foreground">Overview of all your active loads and recent activity</p>
            </div>

            <div className="text-center space-y-4">
              <div className="relative mx-auto w-48 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-1">
                <div className="w-full h-full bg-background rounded-xl overflow-hidden">
                  <Image
                    src="/mobile-tracking-screen-showing-map-with-delivery-r.jpg"
                    alt="Tracking Screen"
                    width={180}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold">Live Tracking</h3>
              <p className="text-sm text-muted-foreground">Real-time GPS tracking with delivery updates</p>
            </div>

            <div className="text-center space-y-4">
              <div className="relative mx-auto w-48 h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-1">
                <div className="w-full h-full bg-background rounded-xl overflow-hidden">
                  <Image
                    src="/mobile-messaging-interface-showing-chat-between-sh.jpg"
                    alt="Messaging Screen"
                    width={180}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold">Messaging</h3>
              <p className="text-sm text-muted-foreground">Direct communication with carriers and shippers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-12 text-center">
              <div className="space-y-8 max-w-3xl mx-auto">
                <div className="space-y-4">
                  <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Get Started?</h2>
                  <p className="text-lg text-muted-foreground text-pretty">
                    Join thousands of shippers and carriers who trust LodEx for their logistics needs. Download the app
                    and start shipping smarter today.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Button asChild size="lg" className="flex-1">
                    <Link href="/auth">
                      <Download className="mr-2 h-5 w-5" />
                      App Store
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="flex-1 bg-transparent">
                    <Link href="/auth">
                      <Download className="mr-2 h-5 w-5" />
                      Google Play
                    </Link>
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">Free to download • Available on iOS and Android</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Frequently Asked Questions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Is the app free to use?</h3>
                <p className="text-muted-foreground text-pretty">
                  Yes, the LodEx mobile app is completely free to download and use. You only pay our standard platform
                  fees when you complete shipments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Does it work offline?</h3>
                <p className="text-muted-foreground text-pretty">
                  The app requires an internet connection for real-time features, but you can view previously loaded
                  data and prepare loads offline.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Can I manage multiple accounts?</h3>
                <p className="text-muted-foreground text-pretty">
                  Yes, you can easily switch between shipper and carrier accounts within the same app if you operate in
                  both capacities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">How secure is my data?</h3>
                <p className="text-muted-foreground text-pretty">
                  We use bank-level encryption and security measures to protect your data. All communications and
                  transactions are fully secured.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
