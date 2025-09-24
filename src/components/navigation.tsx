"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { ResponsiveSidebar } from '@/components/responsive-sidebar'
import { useAuthStore } from "@/store/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [/*unused*/] = useState(false)
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuthStore()

  const handleLogout = () => logout()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <ResponsiveSidebar variant="public" />
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white border-2 border-primary/20 p-1 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/lodex-logo.jpg" 
                  alt="LodEx Logo" 
                  className="h-full w-full object-contain rounded"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
              <span className="text-2xl font-bold text-foreground">LodEx™</span>
            </Link>
          </div>
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">How It Works</Link>
            {!isAuthenticated && (
              <>
                <Link href="/for-shippers" className="text-sm font-medium text-foreground hover:text-primary transition-colors">For Shippers</Link>
                <Link href="/for-carriers" className="text-sm font-medium text-foreground hover:text-primary transition-colors">For Carriers</Link>
                <Link href="/post-load" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Post a Load</Link>
                <Link href="/download" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Download App</Link>
                <Link href="/pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Pricing</Link>
              </>
            )}
            {isAuthenticated && user?.role === 'shipper' && (
              <>
                <Link href="/dashboard/shipper" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Dashboard</Link>
                <Link href="/dashboard/shipper/loads" className="text-sm font-medium text-foreground hover:text-primary transition-colors">My Loads</Link>
                <Link href="/dashboard/shipper/post-load" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Post Load</Link>
              </>
            )}
            {isAuthenticated && (user?.role === 'carrier' || user?.role === 'driver') && (
              <>
                <Link href="/dashboard/carrier" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Dashboard</Link>
                <Link href="/dashboard/carrier/loads" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Find Loads</Link>
                <Link href="/dashboard/carrier/assigned" className="text-sm font-medium text-foreground hover:text-primary transition-colors">My Loads</Link>
              </>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link href="/dashboard/admin/users" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Users</Link>
                <Link href="/dashboard/admin/loads" className="text-sm font-medium text-foreground hover:text-primary transition-colors">All Loads</Link>
              </>
            )}
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">About Us</Link>
            <Link href="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href={getDashboardRoute()}>
                  <Button variant="outline" className="bg-transparent">Dashboard</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href={getDashboardRoute()}>Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth"><Button variant="outline" className="bg-transparent">Sign In</Button></Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
