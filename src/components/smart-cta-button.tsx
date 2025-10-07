'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/hooks/use-toast'

interface SmartCTAButtonProps {
  defaultText: string
  shipperText?: string
  carrierText?: string
  shipperHref?: string
  carrierHref?: string
  defaultHref: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
  targetRole?: 'shipper' | 'carrier' // Which role this CTA is intended for
}

export function SmartCTAButton({
  defaultText,
  shipperText,
  carrierText,
  shipperHref,
  carrierHref,
  defaultHref,
  variant = 'default',
  size = 'lg',
  className = '',
  showIcon = true,
  targetRole
}: SmartCTAButtonProps) {
  const { user, isAuthenticated } = useAuthStore()
  const { toast } = useToast()
  const [isClicked, setIsClicked] = useState(false)

  const userRole = user?.role

  // Check if user is trying to access a CTA meant for a different role
  const checkRoleMismatch = () => {
    if (!isAuthenticated || !targetRole) return false

    // If targetRole is 'shipper' but user is carrier/driver
    if (targetRole === 'shipper' && (userRole === 'carrier' || userRole === 'driver')) {
      return true
    }

    // If targetRole is 'carrier' but user is shipper
    if (targetRole === 'carrier' && userRole === 'shipper') {
      return true
    }

    return false
  }

  const handleClick = (e: React.MouseEvent) => {
    if (checkRoleMismatch()) {
      e.preventDefault()
      setIsClicked(true)
      
      const roleNames = {
        shipper: 'Shipper',
        carrier: 'Carrier',
        driver: 'Carrier'
      }

      const currentRoleName = roleNames[userRole as keyof typeof roleNames] || 'User'
      const targetRoleName = roleNames[targetRole as keyof typeof roleNames] || 'User'

      toast({
        title: "Action Not Available",
        description: `You're logged in as a ${currentRoleName}. This action is for ${targetRoleName}s only. Please use your dashboard or logout to switch accounts.`,
        variant: "destructive",
      })

      // Reset after showing message
      setTimeout(() => setIsClicked(false), 300)
    }
  }

  const getButtonText = () => {
    if (!isAuthenticated) return defaultText
    
    if (userRole === 'shipper' && shipperText) {
      return shipperText
    }
    
    if ((userRole === 'carrier' || userRole === 'driver') && carrierText) {
      return carrierText
    }
    
    return defaultText
  }

  const getButtonHref = () => {
    // If role mismatch, return current page to prevent navigation
    if (checkRoleMismatch()) {
      return '#'
    }

    if (userRole === 'shipper' && shipperHref) {
      return shipperHref
    }
    
    if ((userRole === 'carrier' || userRole === 'driver') && carrierHref) {
      return carrierHref
    }
    
    return defaultHref
  }

  const href = getButtonHref()
  const isBlocked = checkRoleMismatch()

  return (
    <Button 
      asChild={!isBlocked} 
      size={size} 
      variant={variant} 
      className={className}
      onClick={isBlocked ? handleClick : undefined}
    >
      {!isBlocked ? (
        <Link href={href}>
          {getButtonText()}
          {showIcon && <ArrowRight className="ml-2 h-5 w-5" />}
        </Link>
      ) : (
        <>
          {getButtonText()}
          {showIcon && <ArrowRight className="ml-2 h-5 w-5" />}
        </>
      )}
    </Button>
  )
}
