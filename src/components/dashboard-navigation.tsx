"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Truck, User, LogOut } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LodEx™ Dashboard</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Back to Home
            </Link>
            <Link href={user?.role === 'shipper' ? "/dashboard/shipper" : "/dashboard/carrier"} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            
            {/* Role-specific navigation */}
            {user?.role === 'shipper' && (
              <>
                <Link href="/dashboard/shipper/loads" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  My Loads
                </Link>
                <Link href="/dashboard/shipper/post-load" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Post Load
                </Link>
              </>
            )}
            
            {user?.role === 'carrier' && (
              <>
                <Link href="/dashboard/carrier/loads" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Available Loads
                </Link>
                <Link href="/dashboard/carrier/assigned" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  My Loads
                </Link>
              </>
            )}
            
            {user?.role === 'admin' && (
              <>
                <Link href="/dashboard/admin/users" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Manage Users
                </Link>
                <Link href="/dashboard/admin/loads" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  All Loads
                </Link>
                <Link href="/dashboard/admin/reports" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Reports
                </Link>
              </>
            )}
            
            <Link href="/dashboard/profile" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Profile
            </Link>
            <Link href="/dashboard/settings" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Settings
            </Link>
          </nav>

          {/* User Profile Dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Back to Home
              </Link>
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              
              {/* Role-specific mobile navigation */}
              {user?.role === 'shipper' && (
                <>
                  <Link
                    href="/dashboard/shipper/loads"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    My Loads
                  </Link>
                  <Link
                    href="/dashboard/shipper/post-load"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Post Load
                  </Link>
                </>
              )}
              
              {user?.role === 'carrier' && (
                <>
                  <Link
                    href="/dashboard/carrier/loads"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Available Loads
                  </Link>
                  <Link
                    href="/dashboard/carrier/assigned"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    My Loads
                  </Link>
                </>
              )}
              
              {user?.role === 'admin' && (
                <>
                  <Link
                    href="/dashboard/admin/users"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Manage Users
                  </Link>
                  <Link
                    href="/dashboard/admin/loads"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    All Loads
                  </Link>
                  <Link
                    href="/dashboard/admin/reports"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Reports
                  </Link>
                </>
              )}
              
              <Link
                href="/dashboard/profile"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Link>
              <div className="border-t pt-3 mt-3">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent mt-2 mx-3"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}