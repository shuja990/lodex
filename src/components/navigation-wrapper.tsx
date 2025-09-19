"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "./navigation"
import { DashboardNavigation } from "./dashboard-navigation"

export function NavigationWrapper() {
  const pathname = usePathname()
  
  // Don't show any navigation on dashboard routes
  if (pathname?.startsWith('/dashboard')) {
    return <DashboardNavigation />
  }
  
  // Show public navigation for all other routes
  return <Navigation />
}