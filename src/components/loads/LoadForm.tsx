'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AddressAutocompleteController, MapboxMap } from '@/components/mapbox';
import { CreateLoadRequest, UpdateLoadRequest, LoadLocation, LoadType, EquipmentType, Load } from '@/types/load';
import { Save, MapPin, Phone } from 'lucide-react';
import { getRoute } from '@/lib/geolocation';

const loadTypes: LoadType[] = ['Full Truckload', 'Less Than Truckload', 'Partial Load', 'Expedited', 'Temperature Controlled'];
const equipmentTypes: EquipmentType[] = ['Dry Van', 'Flatbed', 'Refrigerated', 'Box Truck', 'Step Deck', 'Lowboy', 'Tanker', 'Other'];

export interface LoadFormProps {
  load?: Load;
  onSubmit: (data: CreateLoadRequest | UpdateLoadRequest) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

interface LoadFormData {
  // Locations
  origin: LoadLocation | null;
  destination: LoadLocation | null;
  // Add the rest of the fields as before...
  loadType: LoadType;
  equipmentType: EquipmentType;
  weight: string;
  length: string;
  width: string;
  height: string;
  pieces: string;
  description: string;
  specialInstructions: string;
  hazmat: boolean;
  temperatureControlled: boolean;
  tempMin: string;
  tempMax: string;
  pickupDate: string;
  deliveryDate: string;
  pickupTime: string;
  deliveryTime: string;
  rate: string;
  pickupContactName: string;
  pickupContactPhone: string;
  pickupContactEmail: string;
  deliveryContactName: string;
  deliveryContactPhone: string;
  deliveryContactEmail: string;
  referenceNumber: string;
}

export default function LoadForm({
  load,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create'
}: LoadFormProps) {
  const [activeTab, setActiveTab] = useState('locations');
  const [showPreview, setShowPreview] = useState(false);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(false);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [routeCoords, setRouteCoords] = useState<Array<[number, number]>>([]);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    getValues
  } = useForm<LoadFormData>({
    // Keep field values when components unmount (e.g., switching tabs)
    shouldUnregister: false,
    // Validate as user types/changes to enable Next button reactively
    mode: 'onChange',
    defaultValues: {
      origin: load?.origin || null,
      destination: load?.destination || null,
      loadType: load?.loadType || 'Full Truckload',
      equipmentType: load?.equipmentType || 'Dry Van',
      weight: load?.details.weight?.toString() || '1000',
      length: load?.details.length?.toString() || '',
      width: load?.details.width?.toString() || '',
      height: load?.details.height?.toString() || '',
      pieces: load?.details.pieces?.toString() || '',
      description: load?.details.description || 'General cargo',
      specialInstructions: load?.details.specialInstructions || '',
      hazmat: load?.details.hazmat || false,
      temperatureControlled: load?.details.temperatureControlled || false,
      tempMin: load?.details.temperatureRange?.min?.toString() || '',
      tempMax: load?.details.temperatureRange?.max?.toString() || '',
  pickupDate: load?.pickupDate ? new Date(load.pickupDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  deliveryDate: load?.deliveryDate ? new Date(load.deliveryDate).toISOString().split('T')[0] : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pickupTime: load?.pickupTime || '',
      deliveryTime: load?.deliveryTime || '',
      rate: load?.rate?.toString() || '1000',
      pickupContactName: load?.contactInfo.pickup.name || 'John Doe',
      pickupContactPhone: load?.contactInfo.pickup.phone || '555-123-4567',
      pickupContactEmail: load?.contactInfo.pickup.email || '',
      deliveryContactName: load?.contactInfo.delivery.name || 'Jane Smith',
      deliveryContactPhone: load?.contactInfo.delivery.phone || '555-987-6543',
      deliveryContactEmail: load?.contactInfo.delivery.email || '',
      referenceNumber: load?.referenceNumber || ''
    }
  });

  const watchedOrigin = watch('origin');
  const watchedDestination = watch('destination');
  const watchedTemperatureControlled = watch('temperatureControlled');
  const watchedWeight = watch('weight');
  const watchedLoadType = watch('loadType');
  const watchedEquipmentType = watch('equipmentType');
  // Watch pickup and delivery dates for dynamic min/max
  const watchedPickupDate = watch('pickupDate');
  // watchedDeliveryDate removed as max is not used

  // Force re-render when form values change to update button states
  const [, setForceUpdate] = useState({});
  useEffect(() => {
    setForceUpdate({});
  }, [watchedWeight, watchedLoadType, watchedEquipmentType, watchedOrigin, watchedDestination]);

  // Tab validation functions
  const validateLocationsTab = () => {
    const { origin, destination } = getValues();
    return Boolean(origin?.coordinates?.latitude && origin?.coordinates?.longitude && 
                  destination?.coordinates?.latitude && destination?.coordinates?.longitude);
  };

  const validateDetailsTab = () => {
    const { weight, loadType, description, rate } = getValues();
    const isValid = Boolean(weight && loadType && description && rate);
    console.log('Details tab validation:', { 
      weight, 
      loadType, 
      description,
      rate,
      isValid
    });
    return isValid;
  };

  const validateTimingTab = () => {
    const { pickupDate, deliveryDate } = getValues();
    if (!pickupDate || !deliveryDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    // Not in the past
    if (pickupDate < todayStr || deliveryDate < todayStr) return false;
    // Delivery cannot be before pickup
    if (deliveryDate < pickupDate) return false;
    return true;
  };

  const isTabValid = (tab: string) => {
    switch (tab) {
      case 'locations': return validateLocationsTab();
      case 'details': return validateDetailsTab();
      case 'timing': return validateTimingTab();
      case 'schedule': return validateTimingTab(); // schedule is same as timing
      default: return true;
    }
  };

  const markTabCompleted = (tab: string) => {
    if (isTabValid(tab)) {
      setCompletedTabs(prev => new Set([...prev, tab]));
    }
  };

  const canProceedToTab = (tab: string, currentTab: string) => {
    const tabOrder = ['locations', 'details', 'schedule', 'contacts'];
    const currentIndex = tabOrder.indexOf(currentTab);
    const targetIndex = tabOrder.indexOf(tab);
    
    // Can always go back
    if (targetIndex <= currentIndex) return true;
    
    // Can go forward only if current tab is valid
    return isTabValid(currentTab);
  };

  const handleTabChange = (tab: string) => {
    console.log(`Changing from ${activeTab} to ${tab}`);
    
    // Save current form state before changing tabs
    const currentValues = getValues();
    console.log('Current form values:', currentValues);
    localStorage.setItem('loadFormData', JSON.stringify(currentValues));
    
    if (canProceedToTab(tab, activeTab)) {
      markTabCompleted(activeTab);
      setActiveTab(tab);
    } else {
      console.log(`Cannot proceed to ${tab} from ${activeTab}`);
    }
  };

  const handleNextTab = () => {
    console.log('Next tab clicked from:', activeTab);
    
    // Force save current state
    const currentValues = getValues();
    localStorage.setItem('loadFormData', JSON.stringify(currentValues));
    
    const tabOrder = ['locations', 'details', 'schedule', 'contacts'];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1 && isTabValid(activeTab)) {
      const nextTab = tabOrder[currentIndex + 1];
      markTabCompleted(activeTab);
      setActiveTab(nextTab);
      console.log('Moved to:', nextTab);
    } else {
      console.log('Cannot move to next tab - validation failed or at end');
    }
  };

  const handlePrevTab = () => {
    const tabOrder = ['locations', 'details', 'schedule', 'contacts'];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  // Auto-save form data to localStorage for persistence
  const watchedValues = watch();
  useEffect(() => {
    if (mode === 'create') {
      // Filter out undefined values before saving
      const filteredValues = Object.fromEntries(
        Object.entries(watchedValues).filter(([, value]) => value !== undefined)
      );
      console.log('Saving form data to localStorage:', filteredValues);
      localStorage.setItem('loadFormData', JSON.stringify(filteredValues));
    }
  }, [watchedValues, mode]);

  // Restore form data on mount  
  useEffect(() => {
    console.log('Form initialization - mode:', mode, 'load:', load);
    
    if (mode === 'create' && !load) {
      // Add a small delay to ensure form is fully initialized
      setTimeout(() => {
        const currentDefaults = getValues();
        console.log('Current form defaults before restore:', currentDefaults);
        
        const savedData = localStorage.getItem('loadFormData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log('Attempting to restore form data:', parsedData);
            
            // Define fields that should keep their defaults if saved value is empty
            const fieldsWithDefaults = ['description', 'rate', 'weight', 'loadType', 'equipmentType'];
            
            // Only restore fields that have meaningful values and differ from defaults
            Object.keys(parsedData).forEach(key => {
              const value = parsedData[key];
              const currentValue = currentDefaults[key as keyof LoadFormData];
              
              // For fields with defaults, only restore if we have a meaningful non-default value
              if (fieldsWithDefaults.includes(key)) {
                if (value && value !== '' && value !== null && value !== undefined) {
                  console.log(`Restoring ${key}: "${currentValue}" -> "${value}"`);
                  setValue(key as keyof LoadFormData, value, { 
                    shouldValidate: true,
                    shouldDirty: true 
                  });
                } else {
                  console.log(`Keeping default for ${key}: "${currentValue}" (saved was: "${value}")`);
                }
              } else {
                // For other fields, restore if meaningful and different
                if (value !== undefined && value !== null && value !== '' && value !== currentValue) {
                  console.log(`Restoring ${key}: "${currentValue}" -> "${value}"`);
                  setValue(key as keyof LoadFormData, value, { 
                    shouldValidate: true,
                    shouldDirty: true 
                  });
                }
              }
            });
          } catch (error) {
            console.error('Error restoring form data:', error);
          }
        } else {
          console.log('No saved form data found');
        }
      }, 100);
    }
  }, [mode, load, setValue, getValues]);

  // Clear saved data on successful submit
  const clearSavedData = () => {
    localStorage.removeItem('loadFormData');
  };

  // Fetch a driving route when both locations are present
  useEffect(() => {
    let active = true;
    const fetchRoute = async () => {
      if (!watchedOrigin || !watchedDestination) {
        setRouteCoords([]);
        return;
      }
      try {
        console.log('Fetching route between:', watchedOrigin, watchedDestination);
        setIsRouteLoading(true);
        const routeData = await getRoute(watchedOrigin.coordinates, watchedDestination.coordinates);
        console.log('Route data received:', routeData);
        if (active && routeData && routeData.routes && routeData.routes[0]) {
          console.log('Setting route coordinates:', routeData.routes[0].geometry.coordinates);
          setRouteCoords(routeData.routes[0].geometry.coordinates);
        } else {
          console.log('No route data or no active component');
          if (active) setRouteCoords([]);
        }
      } catch (err) {
        console.error('Error fetching driving route:', err);
        if (active) setRouteCoords([]);
      } finally {
        if (active) setIsRouteLoading(false);
      }
    };
    fetchRoute();
    return () => { active = false; };
  }, [watchedOrigin, watchedDestination]);

  // Show preview when both locations are selected
  useEffect(() => {
    if (watchedOrigin && watchedDestination) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [watchedOrigin, watchedDestination]);

  // Function to reverse geocode coordinates to address
  const reverseGeocode = async (coordinates: [number, number]): Promise<LoadLocation | null> => {
    try {
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('Mapbox access token not configured');
      }

      const [longitude, latitude] = coordinates;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&types=address`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }
      
      const data = await response.json();
      const feature = data.features?.[0];
      
      if (feature) {
        // Extract address components
        const addressComponents = feature.context || [];
        let city = '', state = '', zipCode = '';
        
        for (const component of addressComponents) {
          if (component.id.includes('place')) {
            city = component.text;
          } else if (component.id.includes('region')) {
            state = component.short_code || component.text;
          } else if (component.id.includes('postcode')) {
            zipCode = component.text;
          }
        }

        return {
          address: feature.place_name,
          city,
          state,
          zipCode,
          coordinates: { latitude, longitude }
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  };

  // Handle map click for address selection
  const handleMapClick = async (coordinates: [number, number]) => {
    if (!isSelectingOrigin && !isSelectingDestination) return;
    
    const location = await reverseGeocode(coordinates);
    if (location) {
      if (isSelectingOrigin) {
        setValue('origin', location);
        setIsSelectingOrigin(false);
      } else if (isSelectingDestination) {
        setValue('destination', location);
        setIsSelectingDestination(false);
      }
    }
  };

  // Handle marker drag to update the corresponding address via reverse geocoding
  const handleMarkerDragEnd = async ({ id, coordinates }: { id?: string; coordinates: [number, number] }) => {
    const [lng, lat] = coordinates;
    const location = await reverseGeocode([lng, lat]);
    if (!location) return;
    if (id === 'origin') {
      setValue('origin', location);
    } else if (id === 'destination') {
      setValue('destination', location);
    }
  };

  const handleFormSubmit = async (data: LoadFormData) => {
    console.log('Form submit started with data:', data);
    
    if (!data.origin || !data.destination) {
      alert('Please select both pickup and delivery locations');
      return;
    }

    // Set default values for required fields that might be empty
    const defaultWeight = data.weight || "1000";
    const defaultRate = data.rate || "1000";
    const defaultPickupDate = data.pickupDate || new Date().toISOString().split('T')[0];
    const defaultDeliveryDate = data.deliveryDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]; // tomorrow
    const defaultDescription = data.description || "Load shipment";
    const defaultPickupContactName = data.pickupContactName || "Contact";
    const defaultPickupContactPhone = data.pickupContactPhone || "555-0000";
    const defaultDeliveryContactName = data.deliveryContactName || "Contact";
    const defaultDeliveryContactPhone = data.deliveryContactPhone || "555-0000";

    // Defensive checks for contact info
    if (!defaultPickupContactName || !defaultPickupContactPhone || !defaultDeliveryContactName || !defaultDeliveryContactPhone) {
      alert('Pickup and delivery contact name and phone are required.');
      return;
    }

    try {
      const formData: CreateLoadRequest | UpdateLoadRequest = {
        origin: data.origin,
        destination: data.destination,
        loadType: data.loadType,
        equipmentType: data.equipmentType,
        details: {
          weight: parseFloat(defaultWeight),
          length: data.length ? parseFloat(data.length) : undefined,
          width: data.width ? parseFloat(data.width) : undefined,
          height: data.height ? parseFloat(data.height) : undefined,
          pieces: data.pieces ? parseInt(data.pieces) : undefined,
          description: defaultDescription,
          specialInstructions: data.specialInstructions || undefined,
          hazmat: data.hazmat,
          temperatureControlled: data.temperatureControlled,
          temperatureRange: data.temperatureControlled && data.tempMin && data.tempMax ? {
            min: parseFloat(data.tempMin),
            max: parseFloat(data.tempMax)
          } : undefined
        },
        pickupDate: defaultPickupDate,
        deliveryDate: defaultDeliveryDate,
        pickupTime: data.pickupTime || undefined,
        deliveryTime: data.deliveryTime || undefined,
        rate: parseFloat(defaultRate),
        contactInfo: {
          pickup: {
            name: defaultPickupContactName,
            phone: defaultPickupContactPhone,
            email: data.pickupContactEmail || undefined
          },
          delivery: {
            name: defaultDeliveryContactName,
            phone: defaultDeliveryContactPhone,
            email: data.deliveryContactEmail || undefined
          }
        },
        referenceNumber: data.referenceNumber || undefined
      };

      console.log('Submitting form data:', formData);

      await onSubmit(formData);
      console.log('Form submission successful');
      clearSavedData(); // Clear saved form data on successful submit
    } catch (error) {
      console.error('Form submission error:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit form');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Load' : 'Edit Load'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Fill out the form below to post a new load'
              : 'Update the load information below'
            }
          </p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger 
                  value="locations" 
                  className={completedTabs.has('locations') ? 'bg-green-100 text-green-800' : ''}
                >
                  Locations {completedTabs.has('locations') && '✓'}
                </TabsTrigger>
                <TabsTrigger 
                  value="details"
                  disabled={!canProceedToTab('details', activeTab)}
                  className={completedTabs.has('details') ? 'bg-green-100 text-green-800' : ''}
                >
                  Load Details {completedTabs.has('details') && '✓'}
                </TabsTrigger>
                <TabsTrigger 
                  value="schedule"
                  disabled={!canProceedToTab('schedule', activeTab)}
                  className={completedTabs.has('schedule') ? 'bg-green-100 text-green-800' : ''}
                >
                  Schedule {completedTabs.has('schedule') && '✓'}
                </TabsTrigger>
                <TabsTrigger 
                  value="contacts"
                  disabled={!canProceedToTab('contacts', activeTab)}
                  className={completedTabs.has('contacts') ? 'bg-green-100 text-green-800' : ''}
                >
                  Contacts {completedTabs.has('contacts') && '✓'}
                </TabsTrigger>
              </TabsList>

              {/* Locations Tab */}
              <TabsContent value="locations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AddressAutocompleteController<LoadFormData>
                        name="origin"
                        control={control}
                        label="Pickup Location"
                        placeholder="Enter pickup address..."
                        required
                        rules={{ required: 'Pickup location is required' }}
                      />
                      <Button
                        type="button"
                        variant={isSelectingOrigin ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setIsSelectingOrigin(!isSelectingOrigin);
                          setIsSelectingDestination(false);
                        }}
                        className="mt-6"
                      >
                        <MapPin className="h-4 w-4" />
                        {isSelectingOrigin ? 'Cancel' : 'Pick on Map'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AddressAutocompleteController<LoadFormData>
                        name="destination"
                        control={control}
                        label="Delivery Location"
                        placeholder="Enter delivery address..."
                        required
                        rules={{ required: 'Delivery location is required' }}
                      />
                      <Button
                        type="button"
                        variant={isSelectingDestination ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setIsSelectingDestination(!isSelectingDestination);
                          setIsSelectingOrigin(false);
                        }}
                        className="mt-6"
                      >
                        <MapPin className="h-4 w-4" />
                        {isSelectingDestination ? 'Cancel' : 'Pick on Map'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Interactive Map */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Interactive Map</h3>
                    {(isSelectingOrigin || isSelectingDestination) && (
                      <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
                        Click on the map to select {isSelectingOrigin ? 'pickup' : 'delivery'} location
                      </div>
                    )}
                    {isRouteLoading && (
                      <div className="text-sm text-gray-600">Building route…</div>
                    )}
                  </div>
                  <MapboxMap
                    height="500px"
                    center={[-98.5795, 39.8283]}
                    zoom={4}
                    markers={[
                      ...(watchedOrigin ? [{
                        coordinates: [
                          watchedOrigin.coordinates.longitude,
                          watchedOrigin.coordinates.latitude
                        ] as [number, number],
                        color: '#10B981',
                        popup: `<strong>Pickup:</strong><br/>${watchedOrigin.address}`,
                        id: 'origin'
                      }] : []),
                      ...(watchedDestination ? [{
                        coordinates: [
                          watchedDestination.coordinates.longitude,
                          watchedDestination.coordinates.latitude
                        ] as [number, number],
                        color: '#EF4444',
                        popup: `<strong>Delivery:</strong><br/>${watchedDestination.address}`,
                        id: 'destination'
                      }] : [])
                    ]}
                    route={routeCoords}
                    onMapClick={handleMapClick}
                    bounds={
                      watchedOrigin && watchedDestination ? [
                        [
                          Math.min(watchedOrigin.coordinates.longitude, watchedDestination.coordinates.longitude) - 0.1,
                          Math.min(watchedOrigin.coordinates.latitude, watchedDestination.coordinates.latitude) - 0.1
                        ],
                        [
                          Math.max(watchedOrigin.coordinates.longitude, watchedDestination.coordinates.longitude) + 0.1,
                          Math.max(watchedOrigin.coordinates.latitude, watchedDestination.coordinates.latitude) + 0.1
                        ]
                      ] : undefined
                    }
                    fitBounds={!!(watchedOrigin && watchedDestination)}
                    markerDraggable
                    onMarkerDragEnd={handleMarkerDragEnd}
                  />
                </div>

                {showPreview && watchedOrigin && watchedDestination && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Route Summary</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-green-600 mb-2">Pickup Location</h4>
                          <p className="text-sm">{watchedOrigin.address}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-600 mb-2">Delivery Location</h4>
                          <p className="text-sm">{watchedDestination.address}</p>
                        </div>
                      </div>
                      {mode === 'create' && (
                        <div className="mt-4 text-center">
                          <Button 
                            type="button" 
                            onClick={async () => {
                              console.log('Quick create button clicked');
                              const currentFormData = watch();
                              console.log('Current form data:', currentFormData);
                              if (!currentFormData.origin || !currentFormData.destination) {
                                alert('Please select both pickup and delivery locations first');
                                return;
                              }
                              await handleFormSubmit(currentFormData);
                            }}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isSubmitting ? 'Creating...' : 'Quick Create Load'}
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            Creates load with default values. You can edit details later.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <div></div> {/* Empty div for spacing */}
                  <Button
                    type="button"
                    onClick={handleNextTab}
                    disabled={!isTabValid('locations')}
                    className="flex items-center gap-2"
                  >
                    Next: Load Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </TabsContent>

              {/* Load Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="loadType">Load Type *</Label>
                      <Controller
                        name="loadType"
                        control={control}
                        rules={{ required: 'Load type is required' }}
                        render={({ field }) => (
                          <Select 
                            value={field.value || 'Full Truckload'}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select load type" />
                            </SelectTrigger>
                            <SelectContent>
                              {loadTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.loadType && (
                        <p className="text-sm text-red-600 mt-1">{errors.loadType.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="equipmentType">Equipment Type *</Label>
                      <Controller
                        name="equipmentType"
                        control={control}
                        rules={{ required: 'Equipment type is required' }}
                        render={({ field }) => (
                          <Select 
                            value={field.value || 'Dry Van'}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select equipment type" />
                            </SelectTrigger>
                            <SelectContent>
                              {equipmentTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.equipmentType && (
                        <p className="text-sm text-red-600 mt-1">{errors.equipmentType.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight (lbs) *</Label>
                      <Input
                        {...register('weight', { 
                          required: 'Weight is required',
                          pattern: {
                            value: /^\d+(\.\d+)?$/,
                            message: 'Please enter a valid weight'
                          }
                        })}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 40000"
                      />
                      {errors.weight && (
                        <p className="text-sm text-red-600 mt-1">{errors.weight.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="rate">Rate ($) *</Label>
                      <Input
                        {...register('rate', { 
                          required: 'Rate is required',
                          pattern: {
                            value: /^\d+(\.\d+)?$/,
                            message: 'Please enter a valid rate'
                          }
                        })}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2500"
                      />
                      {errors.rate && (
                        <p className="text-sm text-red-600 mt-1">{errors.rate.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="length">Length (ft)</Label>
                        <Input
                          {...register('length')}
                          type="number"
                          step="0.1"
                          placeholder="48"
                        />
                      </div>
                      <div>
                        <Label htmlFor="width">Width (ft)</Label>
                        <Input
                          {...register('width')}
                          type="number"
                          step="0.1"
                          placeholder="8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height (ft)</Label>
                        <Input
                          {...register('height')}
                          type="number"
                          step="0.1"
                          placeholder="9"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="pieces">Number of Pieces</Label>
                      <Input
                        {...register('pieces')}
                        type="number"
                        placeholder="e.g., 20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        {...register('description', { required: 'Description is required' })}
                        placeholder="Describe the cargo..."
                        rows={3}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      {...register('hazmat')}
                    />
                    <Label>Hazardous Materials</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      {...register('temperatureControlled')}
                    />
                    <Label>Temperature Controlled</Label>
                  </div>

                  {watchedTemperatureControlled && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="tempMin">Min Temperature (°F)</Label>
                        <Input
                          {...register('tempMin')}
                          type="number"
                          placeholder="35"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tempMax">Max Temperature (°F)</Label>
                        <Input
                          {...register('tempMax')}
                          type="number"
                          placeholder="38"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    {...register('specialInstructions')}
                    placeholder="Any special handling instructions..."
                    rows={3}
                  />
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevTab}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back: Locations
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const currentValues = getValues();
                      console.log('=== FORM DEBUG ===');
                      console.log('All form values:', currentValues);
                      console.log('Weight specifically:', currentValues.weight);
                      console.log('LoadType specifically:', currentValues.loadType);
                      console.log('EquipmentType specifically:', currentValues.equipmentType);
                      console.log('Description specifically:', currentValues.description);
                      console.log('Rate specifically:', currentValues.rate);
                      console.log('Watched weight:', watchedWeight);
                      console.log('Watched loadType:', watchedLoadType);
                      console.log('Form errors:', errors);
                      console.log('Validation result:', isTabValid('details'));
                      
                      // Check localStorage
                      const saved = localStorage.getItem('loadFormData');
                      console.log('Saved data:', saved ? JSON.parse(saved) : 'none');
                      
                      alert(`Weight: "${currentValues.weight}"\nLoadType: "${currentValues.loadType}"\nDescription: "${currentValues.description}"\nRate: "${currentValues.rate}"\nValid: ${isTabValid('details')}`);
                    }}
                    className="text-xs"
                  >
                    Debug
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      console.log('Setting test values...');
                      setValue('weight', '5000', { shouldValidate: true, shouldDirty: true });
                      setValue('loadType', 'Full Truckload', { shouldValidate: true, shouldDirty: true });
                      setValue('description', 'General cargo', { shouldValidate: true, shouldDirty: true });
                      setValue('rate', '1000', { shouldValidate: true, shouldDirty: true });
                      setTimeout(() => {
                        const values = getValues();
                        console.log('Values after manual set:', values);
                        alert(`After manual set:\nWeight: ${values.weight}\nLoadType: ${values.loadType}\nDescription: ${values.description}\nRate: ${values.rate}`);
                      }, 100);
                    }}
                    className="text-xs"
                  >
                    Test Set
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      console.log('Resetting to defaults...');
                      setValue('weight', '1000');
                      setValue('loadType', 'Full Truckload');
                      setValue('description', 'General cargo');
                      setValue('rate', '1000');
                      setValue('equipmentType', 'Dry Van');
                      localStorage.removeItem('loadFormData');
                      alert('Form reset to defaults and localStorage cleared');
                    }}
                    className="text-xs"
                  >
                    Reset
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleNextTab}
                    disabled={!isTabValid('details')}
                    className="flex items-center gap-2"
                    title={`Validation: Weight=${watchedWeight}, LoadType=${watchedLoadType}, Valid=${isTabValid('details')}`}
                  >
                    Next: Schedule
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 text-green-600 mr-2" />
                        Pickup Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="pickupDate">Pickup Date *</Label>
                        <Input
                          {...register('pickupDate', { 
                            required: 'Pickup date is required',
                            validate: {
                              notPast: (v) => {
                                const today = new Date().toISOString().split('T')[0];
                                return v >= today || 'Pickup date cannot be in the past';
                              },
                              beforeOrEqualDelivery: (v) => {
                                const d = getValues('deliveryDate');
                                return !d || v <= d || 'Pickup date cannot be after delivery date';
                              }
                            }
                          })}
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={getValues('pickupDate') || ''}
                          onChange={e => setValue('pickupDate', e.target.value, { shouldValidate: true, shouldDirty: true })}
                        />
                        {errors.pickupDate && (
                          <p className="text-sm text-red-600 mt-1">{errors.pickupDate.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pickupTime">Pickup Time</Label>
                        <Input
                          {...register('pickupTime')}
                          type="time"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 text-red-600 mr-2" />
                        Delivery Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="deliveryDate">Delivery Date *</Label>
                        <Input
                          {...register('deliveryDate', { 
                            required: 'Delivery date is required',
                            validate: {
                              notPast: (v) => {
                                const today = new Date().toISOString().split('T')[0];
                                return v >= today || 'Delivery date cannot be in the past';
                              },
                              afterOrEqualPickup: (v) => {
                                const p = getValues('pickupDate');
                                return !p || v >= p || 'Delivery date cannot be before pickup date';
                              }
                            }
                          })}
                          type="date"
                          min={watchedPickupDate || new Date().toISOString().split('T')[0]}
                          value={getValues('deliveryDate') || ''}
                          onChange={e => setValue('deliveryDate', e.target.value, { shouldValidate: true, shouldDirty: true })}
                        />
                        {errors.deliveryDate && (
                          <p className="text-sm text-red-600 mt-1">{errors.deliveryDate.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="deliveryTime">Delivery Time</Label>
                        <Input
                          {...register('deliveryTime')}
                          type="time"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <Input
                    {...register('referenceNumber')}
                    placeholder="Internal reference or PO number"
                  />
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevTab}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back: Load Details
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextTab}
                    disabled={!isTabValid('schedule')}
                    className="flex items-center gap-2"
                  >
                    Next: Contacts
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </TabsContent>

              {/* Contacts Tab */}
              <TabsContent value="contacts" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Phone className="h-5 w-5 text-green-600 mr-2" />
                        Pickup Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="pickupContactName">Contact Name *</Label>
                        <Input
                          {...register('pickupContactName', { required: 'Pickup contact name is required' })}
                          placeholder="John Doe"
                          value={getValues('pickupContactName') || ''}
                          onChange={e => setValue('pickupContactName', e.target.value, { shouldValidate: true, shouldDirty: true })}
                        />
                        {errors.pickupContactName && (
                          <p className="text-sm text-red-600 mt-1">{errors.pickupContactName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pickupContactPhone">Phone Number *</Label>
                        <Input
                          {...register('pickupContactPhone', { required: 'Pickup contact phone is required' })}
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={getValues('pickupContactPhone') || ''}
                          onChange={e => setValue('pickupContactPhone', e.target.value, { shouldValidate: true, shouldDirty: true })}
                        />
                        {errors.pickupContactPhone && (
                          <p className="text-sm text-red-600 mt-1">{errors.pickupContactPhone.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pickupContactEmail">Email</Label>
                        <Input
                          {...register('pickupContactEmail')}
                          type="email"
                          placeholder="john@company.com"
                          value={getValues('pickupContactEmail') || ''}
                          onChange={e => setValue('pickupContactEmail', e.target.value, { shouldValidate: true, shouldDirty: true })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Phone className="h-5 w-5 text-red-600 mr-2" />
                        Delivery Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="deliveryContactName">Contact Name *</Label>
                        <Input
                          {...register('deliveryContactName', { required: 'Delivery contact name is required' })}
                          placeholder="Jane Smith"
                          value={getValues('deliveryContactName') || ''}
                          onChange={e => setValue('deliveryContactName', e.target.value, { shouldValidate: true, shouldDirty: true })}
                        />
                        {errors.deliveryContactName && (
                          <p className="text-sm text-red-600 mt-1">{errors.deliveryContactName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="deliveryContactPhone">Phone Number *</Label>
                        <Input
                          {...register('deliveryContactPhone', { required: 'Delivery contact phone is required' })}
                          type="tel"
                          placeholder="(555) 987-6543"
                          value={getValues('deliveryContactPhone') || ''}
                          onChange={e => setValue('deliveryContactPhone', e.target.value, { shouldValidate: true, shouldDirty: true })}
                        />
                        {errors.deliveryContactPhone && (
                          <p className="text-sm text-red-600 mt-1">{errors.deliveryContactPhone.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="deliveryContactEmail">Email</Label>
                        <Input
                          {...register('deliveryContactEmail')}
                          type="email"
                          placeholder="jane@company.com"
                          value={getValues('deliveryContactEmail') || ''}
                          onChange={e => setValue('deliveryContactEmail', e.target.value, { shouldValidate: true, shouldDirty: true })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevTab}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back: Schedule
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting 
                      ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                      : (mode === 'create' ? 'Create Load' : 'Update Load')
                    }
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting 
                  ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                  : (mode === 'create' ? 'Create Load' : 'Update Load')
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}