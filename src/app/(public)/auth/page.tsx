"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Truck, Package, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth"
import { CreateUserRequest, LoginRequest, AuthResponse, UserRole } from "@/types/auth"

function AuthContent() {
  const searchParams = useSearchParams()
  const userType = searchParams.get("type") || "shipper"
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { setAuth, getDashboardRoute } = useAuthStore()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    firstName: "",
    lastName: "",
    phone: "",
    carrierRole: "carrier", // for carrier type users: "carrier" or "driver"
    
    // Truck/Vehicle information
    truckNumber: "",
    truckType: "",
    truckCapacity: "",
    cdlNumber: "",
    dotNumber: "",
    mcNumber: "",
    
    agreeToTerms: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("") // Clear error when user starts typing
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return false
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return false
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        return false
      }

      if (!formData.firstName || !formData.lastName) {
        setError("First and last name are required")
        return false
      }

      // Role-specific validation
      if (userType === "shipper" && !formData.companyName) {
        setError("Company name is required for shippers")
        return false
      }

      if (userType === "carrier" && formData.carrierRole === "carrier") {
        if (!formData.companyName) {
          setError("Company name is required for carriers")
          return false
        }
        if (!formData.mcNumber) {
          setError("MC Number is required for carriers")
          return false
        }
        if (!formData.dotNumber) {
          setError("DOT Number is required for carriers")
          return false
        }
      }

      if (userType === "carrier" && formData.carrierRole === "driver") {
        if (!formData.truckNumber || !formData.truckType || !formData.cdlNumber) {
          setError("Truck number, truck type, and CDL number are required for drivers")
          return false
        }
        if (!formData.dotNumber) {
          setError("DOT Number is required for drivers")
          return false
        }
      }

      if (userType === "carrier" && !formData.phone) {
        setError("Phone number is required for carriers and drivers")
        return false
      }

      if (!formData.agreeToTerms) {
        setError("You must agree to the terms and conditions")
        return false
      }
    }

    return true
  }

  const handleLogin = async (loginData: LoginRequest): Promise<void> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })

    const result: AuthResponse = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }

    if (result.user && result.token) {
      // Store auth data
      setAuth(result.token, {
        _id: result.user._id,
        email: result.user.email,
        role: result.user.role,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        company: result.user.company,
        truckNumber: result.user.truckNumber,
        truckType: result.user.truckType,
        truckCapacity: result.user.truckCapacity,
        cdlNumber: result.user.cdlNumber,
        dotNumber: result.user.dotNumber,
        mcNumber: result.user.mcNumber,
      })

      // Redirect to appropriate dashboard
      const dashboardRoute = getDashboardRoute()
      window.location.href = dashboardRoute
    }
  }

  const handleSignup = async (signupData: CreateUserRequest): Promise<void> => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    })

    const result: AuthResponse = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }

    if (result.user && result.token) {
      // Store auth data
      setAuth(result.token, {
        _id: result.user._id,
        email: result.user.email,
        role: result.user.role,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        company: result.user.company,
        truckNumber: result.user.truckNumber,
        truckType: result.user.truckType,
        truckCapacity: result.user.truckCapacity,
        cdlNumber: result.user.cdlNumber,
        dotNumber: result.user.dotNumber,
        mcNumber: result.user.mcNumber,
      })

      // Redirect to appropriate dashboard
      const dashboardRoute = getDashboardRoute()
      window.location.href = dashboardRoute
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      if (isLogin) {
        const loginData: LoginRequest = {
          email: formData.email,
          password: formData.password,
        }
        await handleLogin(loginData)
      } else {
        // Determine role based on user type
        let role: UserRole
        if (userType === "shipper") {
          role = "shipper"
        } else {
          // For carriers, use the selected role (carrier or driver)
          role = formData.carrierRole as UserRole
        }

        const signupData: CreateUserRequest = {
          email: formData.email,
          password: formData.password,
          role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.companyName || undefined,
          phone: formData.phone || undefined,
          
          // Truck/Vehicle information
          truckNumber: formData.truckNumber || undefined,
          truckType: formData.truckType || undefined,
          truckCapacity: formData.truckCapacity ? parseInt(formData.truckCapacity) : undefined,
          cdlNumber: formData.cdlNumber || undefined,
          dotNumber: formData.dotNumber || undefined,
          mcNumber: formData.mcNumber || undefined,
        }
        await handleSignup(signupData)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white border-2 border-primary/20 p-1 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/lodex-logo.jpg" 
                  alt="LodEx Logo" 
                  className="h-full w-full object-contain rounded"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
              <span className="text-3xl font-bold">LodEx™</span>
            </div>
            <h1 className="text-2xl font-bold text-balance">{isLogin ? "Welcome back" : "Get started"}</h1>
            <p className="text-muted-foreground">
              {isLogin ? `Sign in to your ${userType} account` : `Create your ${userType} account`}
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-4">
            <Tabs value={userType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="shipper" asChild>
                  <Link href="/auth?type=shipper" className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Shipper</span>
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="carrier" asChild>
                  <Link href="/auth?type=carrier" className="flex items-center space-x-2">
                    <Truck className="h-4 w-4" />
                    <span>Carrier</span>
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center justify-center space-x-4">
              <Button variant={isLogin ? "default" : "ghost"} onClick={() => setIsLogin(true)} className="flex-1">
                Sign In
              </Button>
              <Button variant={!isLogin ? "default" : "ghost"} onClick={() => setIsLogin(false)} className="flex-1">
                Sign Up
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common Fields */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Sign Up Additional Fields */}
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Role selection for carriers */}
                  {userType === "carrier" && (
                    <div className="space-y-2">
                      <Label>I am a</Label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="carrierRole"
                            value="carrier"
                            checked={formData.carrierRole === "carrier"}
                            onChange={(e) => handleInputChange("carrierRole", e.target.value)}
                            className="text-primary"
                          />
                          <span>Carrier/Fleet Owner</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="carrierRole"
                            value="driver"
                            checked={formData.carrierRole === "driver"}
                            onChange={(e) => handleInputChange("carrierRole", e.target.value)}
                            className="text-primary"
                          />
                          <span>Independent Driver</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number {userType === "carrier" && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required={userType === "carrier"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company Name {(userType === "shipper" || (userType === "carrier" && formData.carrierRole === "carrier")) && <span className="text-red-500">*</span>}
                      {userType === "carrier" && formData.carrierRole === "driver" && <span className="text-sm text-muted-foreground"> (Optional)</span>}
                    </Label>
                    <Input
                      id="companyName"
                      placeholder={
                        userType === "shipper" ? "Your company name" :
                        formData.carrierRole === "carrier" ? "Your fleet/carrier company name" :
                        "Company name (if applicable)"
                      }
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      required={userType === "shipper" || (userType === "carrier" && formData.carrierRole === "carrier")}
                    />
                  </div>

                  {/* Truck/Vehicle Information for Carriers and Drivers */}
                  {userType === "carrier" && (
                    <>
                      {/* DOT Number - Required for both carriers and drivers */}
                      <div className="space-y-2">
                        <Label htmlFor="dotNumber">
                          DOT Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="dotNumber"
                          placeholder="Enter your DOT number"
                          value={formData.dotNumber}
                          onChange={(e) => handleInputChange("dotNumber", e.target.value)}
                          required
                        />
                      </div>

                      {/* MC Number - Required for carriers (fleet owners) */}
                      {formData.carrierRole === "carrier" && (
                        <div className="space-y-2">
                          <Label htmlFor="mcNumber">
                            MC Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="mcNumber"
                            placeholder="Enter your MC number"
                            value={formData.mcNumber}
                            onChange={(e) => handleInputChange("mcNumber", e.target.value)}
                            required
                          />
                        </div>
                      )}

                      {/* Truck-specific fields for drivers */}
                      {formData.carrierRole === "driver" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="truckNumber">
                                Truck Number <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="truckNumber"
                                placeholder="e.g., T001, ABC123"
                                value={formData.truckNumber}
                                onChange={(e) => handleInputChange("truckNumber", e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="truckType">
                                Truck Type <span className="text-red-500">*</span>
                              </Label>
                              <select
                                id="truckType"
                                value={formData.truckType}
                                onChange={(e) => handleInputChange("truckType", e.target.value)}
                                required
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="">Select truck type</option>
                                <option value="Flatbed">Flatbed</option>
                                <option value="Dry Van">Dry Van</option>
                                <option value="Refrigerated">Refrigerated</option>
                                <option value="Box Truck">Box Truck</option>
                                <option value="Step Deck">Step Deck</option>
                                <option value="Lowboy">Lowboy</option>
                                <option value="Tanker">Tanker</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="truckCapacity">
                                Truck Capacity (tons)
                              </Label>
                              <Input
                                id="truckCapacity"
                                type="number"
                                placeholder="e.g., 26, 40"
                                value={formData.truckCapacity}
                                onChange={(e) => handleInputChange("truckCapacity", e.target.value)}
                                min="1"
                                max="80"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cdlNumber">
                                CDL Number <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="cdlNumber"
                                placeholder="Enter your CDL number"
                                value={formData.cdlNumber}
                                onChange={(e) => handleInputChange("cdlNumber", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>

              {error && (
                <div className="text-sm text-red-600 text-center">
                  {error}
                </div>
              )}

              {isLogin && (
                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign up" : "Sign in"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}
