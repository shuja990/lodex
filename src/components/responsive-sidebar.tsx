"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';

interface SidebarProps {
  triggerClassName?: string;
  variant?: 'public' | 'dashboard';
}

// Consolidated navigation logic so both public & dashboard navs share sidebar on <1024px
export function ResponsiveSidebar({ triggerClassName = '', variant = 'public' }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuthStore();

  const close = () => setOpen(false);

  const commonLinks = [
    { href: '/', label: 'Home', show: variant === 'public' },
    { href: '/how-it-works', label: 'How It Works', show: variant === 'public' },
    { href: '/about', label: 'About Us', show: variant === 'public' },
    { href: '/contact', label: 'Contact', show: variant === 'public' },
  ];

  const authPublicLinks = [
    { href: '/for-shippers', label: 'For Shippers' },
    { href: '/for-carriers', label: 'For Carriers' },
    { href: '/post-load', label: 'Post a Load' },
    { href: '/download', label: 'Download App' },
    { href: '/pricing', label: 'Pricing' },
  ];

  const roleLinks: Record<string, { href: string; label: string }[]> = {
    shipper: [
      { href: '/dashboard/shipper', label: 'Dashboard' },
      { href: '/dashboard/shipper/loads', label: 'My Loads' },
      { href: '/dashboard/shipper/post-load', label: 'Post Load' },
    ],
    carrier: [
      { href: '/dashboard/carrier', label: 'Dashboard' },
      { href: '/dashboard/carrier/loads', label: 'Available Loads' },
      { href: '/dashboard/carrier/offers', label: 'My Offers' },
      { href: '/dashboard/carrier/assigned', label: 'My Loads' },
    ],
    admin: [
      { href: '/dashboard/admin', label: 'Admin Home' },
      { href: '/dashboard/admin/users', label: 'Manage Users' },
      { href: '/dashboard/admin/loads', label: 'All Loads' },
      { href: '/dashboard/admin/offers', label: 'Offers' },
    ],
    driver: [
      { href: '/dashboard/carrier', label: 'Dashboard' },
      { href: '/dashboard/carrier/loads', label: 'Available Loads' },
      { href: '/dashboard/carrier/assigned', label: 'My Loads' },
    ],
  };

  const miscDashboard = [
    { href: '/dashboard/profile', label: 'Profile' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <>
      <Button variant="ghost" size="sm" className={`lg:hidden ${triggerClassName}`} onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <aside className="absolute left-0 top-0 h-screen w-72 bg-background border-r shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href={isAuthenticated ? getDashboardRoute() : '/'} onClick={close} className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border-2 border-primary/20 p-1 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/lodex-logo.jpg" 
                    alt="LodEx Logo" 
                    className="h-full w-full object-contain rounded"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
                <span className="text-xl font-semibold">LodEx™</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={close} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {commonLinks.filter(l => l.show).map(l => (
                <Link key={l.href} href={l.href} onClick={close} className="block px-3 py-2 rounded-md text-sm hover:bg-muted font-medium">
                  {l.label}
                </Link>
              ))}
              {!isAuthenticated && variant === 'public' && authPublicLinks.map(l => (
                <Link key={l.href} href={l.href} onClick={close} className="block px-3 py-2 rounded-md text-sm hover:bg-muted font-medium">
                  {l.label}
                </Link>
              ))}
              {isAuthenticated && user && (
                <>
                  {(roleLinks[user.role] || []).map(l => (
                    <Link key={l.href} href={l.href} onClick={close} className="block px-3 py-2 rounded-md text-sm hover:bg-muted font-medium">
                      {l.label}
                    </Link>
                  ))}
                  {variant === 'dashboard' && miscDashboard.map(l => (
                    <Link key={l.href} href={l.href} onClick={close} className="block px-3 py-2 rounded-md text-sm hover:bg-muted font-medium">
                      {l.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
            <div className="p-4 border-t space-y-3">
              {isAuthenticated ? (
                <Button variant="outline" className="w-full" onClick={() => { logout(); close(); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              ) : (
                <Link href="/auth" className="block" onClick={close}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
              )}
              {isAuthenticated && user && (
                <div className="text-xs text-muted-foreground leading-tight">
                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                  <div>{user.email}</div>
                  <div className="capitalize">{user.role}</div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
