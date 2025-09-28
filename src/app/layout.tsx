import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar"
import { InstallPWA } from "@/components/InstallPWA"
import "./globals.css"

export const metadata: Metadata = {
  title: "LodEx™ - Fast, Reliable Micro-Load Shipping",
  description:
    "Connect with verified carriers, post micro-loads instantly, and track every delivery from start to finish.",
  generator: "v0.app",
  manifest: "/manifest.webmanifest",
  applicationName: "LodEx",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LodEx",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/placeholder-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/placeholder-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/placeholder-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [
      { url: "/placeholder-logo.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <NavigationWrapper />
          {children}
        </Suspense>
        <Toaster />
        <Analytics />
        <ServiceWorkerRegistrar />
        <InstallPWA />
      </body>
    </html>
  )
}

export const viewport: Viewport = {
  themeColor: "#0EA5E9",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  viewportFit: "cover",
}