"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { ResponsiveSidebar } from '@/components/responsive-sidebar'
import { useAuthStore } from "@/store/auth"

export function DashboardNavigation() {
  const { user, logout } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <ResponsiveSidebar variant="dashboard" />
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
              <span className="text-2xl font-bold text-foreground">LodEx™ Dashboard</span>
            </Link>
          </div>
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Back to Home</Link>
            {user?.role === 'shipper' && (
              <>
                <Link href="/dashboard/shipper" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Dashboard</Link>
                <Link href="/dashboard/shipper/loads" className="text-sm font-medium text-foreground hover:text-primary transition-colors">My Loads</Link>
                <Link href="/dashboard/shipper/post-load" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Post Load</Link>
              </>
            )}
            {(user?.role === 'carrier' || user?.role === 'driver') && (
              <>
                <Link href="/dashboard/carrier" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Dashboard</Link>
                <Link href="/dashboard/carrier/loads" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Available Loads</Link>
                <Link href="/dashboard/carrier/offers" className="text-sm font-medium text-foreground hover:text-primary transition-colors">My Offers</Link>
                <Link href="/dashboard/carrier/assigned" className="text-sm font-medium text-foreground hover:text-primary transition-colors">My Loads</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Link href="/dashboard/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Admin Home</Link>
                <Link href="/dashboard/admin/users" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Manage Users</Link>
                <Link href="/dashboard/admin/loads" className="text-sm font-medium text-foreground hover:text-primary transition-colors">All Loads</Link>
                <Link href="/dashboard/admin/offers" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Offers</Link>
              </>
            )}
            <Link href="/dashboard/profile" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Profile</Link>
          </nav>
          <div className="hidden lg:flex items-center space-x-4 relative" ref={dropdownRef}>
            <div className="relative">
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <User className="h-4 w-4" />
              </Button>
              
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md z-[100] py-1">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400">{user?.email}</p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  
                  <Link 
                    href="/dashboard/profile" 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}