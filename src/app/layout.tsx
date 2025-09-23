import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "LodEx™ - Fast, Reliable Micro-Load Shipping",
  description:
    "Connect with verified carriers, post micro-loads instantly, and track every delivery from start to finish.",
  generator: "v0.app",
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
      </body>
    </html>
  )
}