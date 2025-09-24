'use client';

import { useEffect, useState } from 'react';
import { useAuthStore, fetchWithAuth } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Truck, 
  Shield, 
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ProfileData {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  company?: string;
  phone?: string;
  // Carrier/Driver fields
  truckNumber?: string;
  truckType?: string;
  truckCapacity?: number;
  cdlNumber?: string;
  dotNumber?: string;
  mcNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { updateUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    // Carrier/Driver fields
    truckNumber: '',
    truckType: '',
    truckCapacity: '',
    cdlNumber: '',
    dotNumber: '',
    mcNumber: '',
    // Password fields
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/profile');
      const data = await res.json();
      
      if (data.success) {
        setProfile(data.user);
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          company: data.user.company || '',
          phone: data.user.phone || '',
          truckNumber: data.user.truckNumber || '',
          truckType: data.user.truckType || '',
          truckCapacity: data.user.truckCapacity?.toString() || '',
          cdlNumber: data.user.cdlNumber || '',
          dotNumber: data.user.dotNumber || '',
          mcNumber: data.user.mcNumber || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Load profile error:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    // Validate password fields if password change is requested
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required to change password' });
        setSaving(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        setSaving(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
        setSaving(false);
        return;
      }
    }

    try {
      const updatePayload: Record<string, unknown> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        phone: formData.phone,
      };

      // Add carrier/driver specific fields
      if (profile?.role === 'carrier' || profile?.role === 'driver') {
        updatePayload.truckNumber = formData.truckNumber;
        updatePayload.truckType = formData.truckType;
        updatePayload.truckCapacity = formData.truckCapacity ? parseInt(formData.truckCapacity) : undefined;
        updatePayload.cdlNumber = formData.cdlNumber;
        updatePayload.dotNumber = formData.dotNumber;
        updatePayload.mcNumber = formData.mcNumber;
      }

      // Add password change if requested
      if (formData.newPassword && formData.currentPassword) {
        updatePayload.currentPassword = formData.currentPassword;
        updatePayload.newPassword = formData.newPassword;
      }

      const res = await fetchWithAuth('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(updatePayload)
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setProfile(data.user);
        // Update auth store
        updateUser(data.user);
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setShowPasswordFields(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'shipper': return 'bg-blue-100 text-blue-800';
      case 'carrier': return 'bg-green-100 text-green-800';
      case 'driver': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <User className="h-8 w-8 mr-3" />
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`${getRoleBadgeColor(profile.role)} capitalize`}>
            {profile.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
            {profile.role}
          </Badge>
          <Badge variant={profile.isActive ? 'default' : 'secondary'}>
            {profile.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-md border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input 
                    id="email" 
                    value={profile.email} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <div className="flex items-center mt-1">
                  <Building className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input 
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="flex items-center mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input 
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Phone Number"
                    type="tel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carrier/Driver Specific Fields */}
          {(profile.role === 'carrier' || profile.role === 'driver') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Vehicle & License Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="truckNumber">Truck Number</Label>
                    <Input 
                      id="truckNumber"
                      value={formData.truckNumber}
                      onChange={(e) => handleInputChange('truckNumber', e.target.value)}
                      placeholder="Truck Number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="truckType">Truck Type</Label>
                    <Input 
                      id="truckType"
                      value={formData.truckType}
                      onChange={(e) => handleInputChange('truckType', e.target.value)}
                      placeholder="e.g., Flatbed, Dry Van"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="truckCapacity">Truck Capacity (lbs)</Label>
                  <Input 
                    id="truckCapacity"
                    value={formData.truckCapacity}
                    onChange={(e) => handleInputChange('truckCapacity', e.target.value)}
                    placeholder="Maximum weight capacity"
                    type="number"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cdlNumber">CDL Number</Label>
                    <Input 
                      id="cdlNumber"
                      value={formData.cdlNumber}
                      onChange={(e) => handleInputChange('cdlNumber', e.target.value)}
                      placeholder="CDL Number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dotNumber">DOT Number</Label>
                    <Input 
                      id="dotNumber"
                      value={formData.dotNumber}
                      onChange={(e) => handleInputChange('dotNumber', e.target.value)}
                      placeholder="DOT Number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mcNumber">MC Number</Label>
                    <Input 
                      id="mcNumber"
                      value={formData.mcNumber}
                      onChange={(e) => handleInputChange('mcNumber', e.target.value)}
                      placeholder="MC Number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="w-full"
                >
                  {showPasswordFields ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Cancel Password Change
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>

                {showPasswordFields && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Member Since</Label>
                <p className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm text-muted-foreground">Account Status</Label>
                <p className={`font-medium ${profile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm text-muted-foreground">Role</Label>
                <p className="font-medium capitalize">{profile.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}