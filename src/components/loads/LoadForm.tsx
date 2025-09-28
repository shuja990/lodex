"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AddressAutocompleteController, MapboxMap } from "@/components/mapbox";
import type {
  CreateLoadRequest,
  UpdateLoadRequest,
  LoadLocation,
  LoadType,
  EquipmentType,
  Load,
} from "@/types/load";
import { Save, MapPin, Phone } from "lucide-react";
import { getRoute } from "@/lib/geolocation";

const loadTypes: LoadType[] = [
  "Full Truckload",
  "Less Than Truckload",
  "Partial Load",
  "Expedited",
  "Temperature Controlled",
];
const equipmentTypes: EquipmentType[] = [
  "Dry Van",
  "Flatbed",
  "Refrigerated",
  "Box Truck",
  "Step Deck",
  "Lowboy",
  "Tanker",
  "Other",
];

// Schema
const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const locationSchema = z.object({
  address: z.string().min(1),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  coordinates: coordinatesSchema,
});

const formSchema = z
  .object({
    // locations
    origin: locationSchema,
    destination: locationSchema,

    // details
    loadType: z.enum([
      "Full Truckload",
      "Less Than Truckload",
      "Partial Load",
      "Expedited",
      "Temperature Controlled",
    ]),
    equipmentType: z.enum([
      "Dry Van",
      "Flatbed",
      "Refrigerated",
      "Box Truck",
      "Step Deck",
      "Lowboy",
      "Tanker",
      "Other",
    ]),
    weight: z.coerce
      .number()
      .positive({ message: "Weight must be greater than 0" }),
    length: z.coerce
      .number()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    width: z.coerce
      .number()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    height: z.coerce
      .number()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    pieces: z.coerce
      .number()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    description: z.string().min(1, "Description is required"),
    specialInstructions: z
      .string()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    hazmat: z.boolean().default(false),
    temperatureControlled: z.boolean().default(false),
    tempMin: z.coerce
      .number()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    tempMax: z.coerce
      .number()
      .optional()
      .or(z.literal("").transform(() => undefined)),

    // schedule
    pickupDate: z.string().min(1, "Pickup date is required"),
    deliveryDate: z.string().min(1, "Delivery date is required"),
    pickupTime: z
      .string()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    deliveryTime: z
      .string()
      .optional()
      .or(z.literal("").transform(() => undefined)),

    // rate
    rate: z.coerce
      .number()
      .nonnegative({ message: "Rate must be 0 or greater" }),

    // contacts
    pickupContactName: z.string().min(1, "Pickup contact name is required"),
    pickupContactPhone: z.string().min(1, "Pickup contact phone is required"),
    pickupContactEmail: z
      .string()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    deliveryContactName: z.string().min(1, "Delivery contact name is required"),
    deliveryContactPhone: z
      .string()
      .min(1, "Delivery contact phone is required"),
    deliveryContactEmail: z
      .string()
      .optional()
      .or(z.literal("").transform(() => undefined)),

    referenceNumber: z
      .string()
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .superRefine((vals, ctx) => {
    // date logic
    try {
      const today = new Date().toISOString().split("T")[0];
      if (vals.pickupDate < today) {
        ctx.addIssue({
          code: "custom",
          message: "Pickup date cannot be in the past",
          path: ["pickupDate"],
        });
      }
      if (vals.deliveryDate < today) {
        ctx.addIssue({
          code: "custom",
          message: "Delivery date cannot be in the past",
          path: ["deliveryDate"],
        });
      }
      if (vals.deliveryDate < vals.pickupDate) {
        ctx.addIssue({
          code: "custom",
          message: "Delivery cannot be before pickup",
          path: ["deliveryDate"],
        });
      }
      if (vals.temperatureControlled) {
        if (vals.tempMin === undefined || vals.tempMax === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "Provide both min and max temperature",
            path: ["tempMin"],
          });
        } else if (vals.tempMin > vals.tempMax) {
          ctx.addIssue({
            code: "custom",
            message: "Min temperature cannot exceed max",
            path: ["tempMin"],
          });
        }
      }
    } catch {
      // ignore parse errors, handled as required strings
    }
  });

type LoadFormData = z.infer<typeof formSchema>;

export interface LoadFormProps {
  load?: Load;
  onSubmit: (data: CreateLoadRequest | UpdateLoadRequest) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

function toDefaultValues(load?: Load): LoadFormData {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return {
    origin: load?.origin || {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      coordinates: { latitude: 0, longitude: 0 },
    },
    destination: load?.destination || {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      coordinates: { latitude: 0, longitude: 0 },
    },
    loadType: load?.loadType || "Full Truckload",
    equipmentType: load?.equipmentType || "Dry Van",
    weight: load?.details.weight ?? 1000,
    length: load?.details.length ?? "",
    width: load?.details.width ?? "",
    height: load?.details.height ?? "",
    pieces: load?.details.pieces ?? "",
    description: load?.details.description || "General cargo",
    specialInstructions: load?.details.specialInstructions ?? "",
    hazmat: !!load?.details.hazmat,
    temperatureControlled: !!load?.details.temperatureControlled,
    tempMin: load?.details.temperatureRange?.min ?? "",
    tempMax: load?.details.temperatureRange?.max ?? "",
    pickupDate: load?.pickupDate
      ? new Date(load.pickupDate).toISOString().split("T")[0]
      : today,
    deliveryDate: load?.deliveryDate
      ? new Date(load.deliveryDate).toISOString().split("T")[0]
      : tomorrow,
    pickupTime: load?.pickupTime ?? "",
    deliveryTime: load?.deliveryTime ?? "",
    rate: load?.rate ?? 1000,
    pickupContactName: load?.contactInfo.pickup.name || "John Doe",
    pickupContactPhone: load?.contactInfo.pickup.phone || "555-123-4567",
    pickupContactEmail: load?.contactInfo.pickup.email || "",
    deliveryContactName: load?.contactInfo.delivery.name || "Jane Smith",
    deliveryContactPhone: load?.contactInfo.delivery.phone || "555-987-6543",
    deliveryContactEmail: load?.contactInfo.delivery.email || "",
    referenceNumber: load?.referenceNumber || ""
  };
}

export default function LoadForm({
  load,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
}: LoadFormProps) {
  const [activeTab, setActiveTab] = useState("locations");
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(false);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [routeCoords, setRouteCoords] = useState<Array<[number, number]>>([]);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isValid },
  } = useForm<LoadFormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: useMemo(() => toDefaultValues(load), [load]),
  });

  useEffect(() => {
    if (mode === "edit" && load) {
      reset(toDefaultValues(load), { keepDirty: false, keepValues: false });
    }
  }, [mode, load, reset]);

  const watched = watch();
  const watchedOrigin = watched.origin;
  const watchedDestination = watched.destination;
  const watchedTemperatureControlled = watched.temperatureControlled;
  const watchedPickupDate = watched.pickupDate;

  // Tab-level validation slices
  const validateLocationsTab = () => {
    const vals = getValues();
    try {
      locationSchema.parse(vals.origin);
      locationSchema.parse(vals.destination);
      return true;
    } catch {
      return false;
    }
  };
  // Tab validation slices (define as new z.object, not .pick)
  const detailsSlice = z.object({
    loadType: z.enum([
      "Full Truckload",
      "Less Than Truckload",
      "Partial Load",
      "Expedited",
      "Temperature Controlled",
    ]),
    equipmentType: z.enum([
      "Dry Van",
      "Flatbed",
      "Refrigerated",
      "Box Truck",
      "Step Deck",
      "Lowboy",
      "Tanker",
      "Other",
    ]),
    weight: z.coerce
      .number()
      .positive({ message: "Weight must be greater than 0" }),
    description: z.string().min(1, "Description is required"),
    rate: z.coerce
      .number()
      .nonnegative({ message: "Rate must be 0 or greater" }),
    hazmat: z.boolean().default(false),
    temperatureControlled: z.boolean().default(false),
    tempMin: z.coerce
      .number()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    tempMax: z.coerce
      .number()
      .optional()
      .or(z.literal("").transform(() => undefined)),
  });

  const scheduleSlice = z.object({
    pickupDate: z.string().min(1, "Pickup date is required"),
    deliveryDate: z.string().min(1, "Delivery date is required"),
    pickupTime: z.string().optional().or(z.literal("").transform(() => undefined)),
    deliveryTime: z.string().optional().or(z.literal("").transform(() => undefined)),
  });

  const contactsSlice = z.object({
    pickupContactName: z.string().min(1, "Pickup contact name is required"),
    pickupContactPhone: z.string().min(1, "Pickup contact phone is required"),
    deliveryContactName: z.string().min(1, "Delivery contact name is required"),
    deliveryContactPhone: z.string().min(1, "Delivery contact phone is required"),
  });

  const validateDetailsTab = () => detailsSlice.safeParse(getValues()).success;
  const validateScheduleTab = () =>
    scheduleSlice.safeParse(getValues()).success;
  const validateContactsTab = () =>
    contactsSlice.safeParse(getValues()).success;

  const isTabValid = (tab: string) => {
    switch (tab) {
      case "locations":
        return validateLocationsTab();
      case "details":
        return validateDetailsTab();
      case "schedule":
        return validateScheduleTab();
      case "contacts":
        return validateContactsTab();
      default:
        return true;
    }
  };

  const tabOrder = ["locations", "details", "schedule", "contacts"] as const;
  const canProceedToTab = (target: string, current: string) => {
    const currentIndex = tabOrder.indexOf(current as typeof tabOrder[number]);
    const targetIndex = tabOrder.indexOf(target as typeof tabOrder[number]);
    if (targetIndex <= currentIndex) return true;
    return isTabValid(current);
  };

  const markTabCompleted = (tab: string) => {
    if (isTabValid(tab)) {
      setCompletedTabs((prev) => new Set([...prev, tab]));
    }
  };

  const handleTabChange = (tab: string) => {
    console.log(`Changing from ${activeTab} to ${tab}`);
    if (canProceedToTab(tab, activeTab)) {
      markTabCompleted(activeTab);
      setActiveTab(tab);
    }
  };

  const handleNextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab as typeof tabOrder[number]);
    if (currentIndex < tabOrder.length - 1 && isTabValid(activeTab)) {
      const nextTab = tabOrder[currentIndex + 1];
      markTabCompleted(activeTab);
      setActiveTab(nextTab);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab as typeof tabOrder[number]);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  // route compute
  useEffect(() => {
    let active = true;
    const fetchRoute = async () => {
      if (!watchedOrigin?.coordinates || !watchedDestination?.coordinates) {
        setRouteCoords([]);
        return;
      }
      try {
        setIsRouteLoading(true);
        const routeData = await getRoute(
          watchedOrigin.coordinates,
          watchedDestination.coordinates
        );
        if (active && routeData?.routes?.[0]) {
          setRouteCoords(routeData.routes[0].geometry.coordinates);
        } else if (active) {
          setRouteCoords([]);
        }
      } catch (err) {
        console.error("Error fetching driving route:", err);
        if (active) setRouteCoords([]);
      } finally {
        if (active) setIsRouteLoading(false);
      }
    };
    fetchRoute();
    return () => {
      active = false;
    };
  }, [watchedOrigin?.coordinates, watchedDestination?.coordinates]);

  // map helpers (stubbed reverse geocode is inside AddressAutocomplete in this demo)
  const handleMapClick = async (coordinates: [number, number]) => {
    if (!isSelectingOrigin && !isSelectingDestination) return;
    const [lng, lat] = coordinates;
    const location: LoadLocation = {
      address: `Selected at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: "",
      state: "",
      zipCode: "",
      coordinates: { latitude: lat, longitude: lng },
    };
    if (isSelectingOrigin) {
      setValue("origin", location, { shouldValidate: true });
      setIsSelectingOrigin(false);
    } else if (isSelectingDestination) {
      setValue("destination", location, { shouldValidate: true });
      setIsSelectingDestination(false);
    }
  };

  const handleMarkerDragEnd = async ({
    id,
    coordinates,
  }: {
    id?: string;
    coordinates: [number, number];
  }) => {
    const [lng, lat] = coordinates;
    const location: LoadLocation = {
      address: `Moved to ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: "",
      state: "",
      zipCode: "",
      coordinates: { latitude: lat, longitude: lng },
    };
    if (id === "origin") setValue("origin", location, { shouldValidate: true });
    if (id === "destination")
      setValue("destination", location, { shouldValidate: true });
  };

  const onFormSubmit = async (data: LoadFormData) => {
    // Build API payload
    const payload: CreateLoadRequest | UpdateLoadRequest = {
      origin: data.origin,
      destination: data.destination,
      loadType: data.loadType,
      equipmentType: data.equipmentType,
      details: {
        weight: data.weight,
        length: data.length,
        width: data.width,
        height: data.height,
        pieces: data.pieces,
        description: data.description,
        specialInstructions: data.specialInstructions,
        hazmat: data.hazmat,
        temperatureControlled: data.temperatureControlled,
        temperatureRange:
          data.temperatureControlled &&
          data.tempMin !== undefined &&
          data.tempMax !== undefined
            ? { min: data.tempMin, max: data.tempMax }
            : undefined,
      },
      pickupDate: data.pickupDate,
      deliveryDate: data.deliveryDate,
      pickupTime: data.pickupTime,
      deliveryTime: data.deliveryTime,
      rate: data.rate,
      contactInfo: {
        pickup: {
          name: data.pickupContactName,
          phone: data.pickupContactPhone,
          email: data.pickupContactEmail,
        },
        delivery: {
          name: data.deliveryContactName,
          phone: data.deliveryContactPhone,
          email: data.deliveryContactEmail,
        },
      },
      referenceNumber: data.referenceNumber,
    };

    await onSubmit(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Create New Load" : "Edit Load"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Fill out the form below to post a new load"
              : "Update the load information below"}
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
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="locations"
                  className={
                    completedTabs.has("locations")
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                >
                  Locations {completedTabs.has("locations") && "✓"}
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  disabled={!canProceedToTab("details", activeTab)}
                  className={
                    completedTabs.has("details")
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                >
                  Load Details {completedTabs.has("details") && "✓"}
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  disabled={!canProceedToTab("schedule", activeTab)}
                  className={
                    completedTabs.has("schedule")
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                >
                  Schedule {completedTabs.has("schedule") && "✓"}
                </TabsTrigger>
                <TabsTrigger
                  value="contacts"
                  disabled={!canProceedToTab("contacts", activeTab)}
                  className={
                    completedTabs.has("contacts")
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                >
                  Contacts {completedTabs.has("contacts") && "✓"}
                </TabsTrigger>
              </TabsList>

              {/* Locations */}
              <TabsContent value="locations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AddressAutocompleteController
                        name="origin"
                        control={control}
                        label="Pickup Location"
                        placeholder="Enter pickup address..."
                        required
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
                        {isSelectingOrigin ? "Cancel" : "Pick on Map"}
                      </Button>
                    </div>
                    {errors.origin && (
                      <p className="text-sm text-red-600">
                        Please select a valid pickup location
                      </p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AddressAutocompleteController
                        name="destination"
                        control={control}
                        label="Delivery Location"
                        placeholder="Enter delivery address..."
                        required
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
                        {isSelectingDestination ? "Cancel" : "Pick on Map"}
                      </Button>
                    </div>
                    {errors.destination && (
                      <p className="text-sm text-red-600">
                        Please select a valid delivery location
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Interactive Map</h3>
                    {(isSelectingOrigin || isSelectingDestination) && (
                      <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
                        Click on the map to select{" "}
                        {isSelectingOrigin ? "pickup" : "delivery"} location
                      </div>
                    )}
                    {isRouteLoading && (
                      <div className="text-sm text-muted-foreground">
                        Building route…
                      </div>
                    )}
                  </div>

                  <MapboxMap
                    height="400px"
                    center={[-98.5795, 39.8283]}
                    zoom={4}
                    markers={[
                      ...(watchedOrigin && 
                          watchedOrigin.coordinates.latitude !== 0 && 
                          watchedOrigin.coordinates.longitude !== 0
                        ? ([
                            {
                              coordinates: [
                                watchedOrigin.coordinates.longitude,
                                watchedOrigin.coordinates.latitude,
                              ] as [number, number],
                              color: "#10B981",
                              id: "origin",
                            },
                          ] as const)
                        : []),
                      ...(watchedDestination && 
                          watchedDestination.coordinates.latitude !== 0 && 
                          watchedDestination.coordinates.longitude !== 0
                        ? ([
                            {
                              coordinates: [
                                watchedDestination.coordinates.longitude,
                                watchedDestination.coordinates.latitude,
                              ] as [number, number],
                              color: "#EF4444",
                              id: "destination",
                            },
                          ] as const)
                        : []),
                    ]}
                    route={routeCoords}
                    onMapClick={handleMapClick}
                    bounds={
                      watchedOrigin && watchedDestination &&
                      watchedOrigin.coordinates.latitude !== 0 && 
                      watchedOrigin.coordinates.longitude !== 0 &&
                      watchedDestination.coordinates.latitude !== 0 && 
                      watchedDestination.coordinates.longitude !== 0
                        ? ([
                            [
                              Math.min(
                                watchedOrigin.coordinates.longitude,
                                watchedDestination.coordinates.longitude
                              ) - 0.1,
                              Math.min(
                                watchedOrigin.coordinates.latitude,
                                watchedDestination.coordinates.latitude
                              ) - 0.1,
                            ],
                            [
                              Math.max(
                                watchedOrigin.coordinates.longitude,
                                watchedDestination.coordinates.longitude
                              ) + 0.1,
                              Math.max(
                                watchedOrigin.coordinates.latitude,
                                watchedDestination.coordinates.latitude
                              ) + 0.1,
                            ],
                          ] as const)
                        : undefined
                    }
                    fitBounds={!!(watchedOrigin && watchedDestination)}
                    markerDraggable
                    onMarkerDragEnd={handleMarkerDragEnd}
                  />
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <div />
                  <Button
                    type="button"
                    onClick={handleNextTab}
                    disabled={!isTabValid("locations")}
                    className="flex items-center gap-2"
                  >
                    Next: Load Details
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              </TabsContent>

              {/* Details */}
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="loadType">Load Type *</Label>
                      <Controller
                        name="loadType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
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
                        <p className="text-sm text-red-600 mt-1">
                          {errors.loadType.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="equipmentType">Equipment Type *</Label>
                      <Controller
                        name="equipmentType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
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
                        <p className="text-sm text-red-600 mt-1">
                          {errors.equipmentType.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight (lbs) *</Label>
                      <Controller
                        name="weight"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            placeholder="e.g., 40000"
                            value={
                              Number.isNaN(field.value as number)
                                ? ""
                                : String(field.value ?? "")
                            }
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />
                      {errors.weight && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.weight.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="rate">Rate ($) *</Label>
                      <Controller
                        name="rate"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            placeholder="e.g., 2500"
                            value={
                              Number.isNaN(field.value as number)
                                ? ""
                                : String(field.value ?? "")
                            }
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />
                      {errors.rate && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.rate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="length">Length (ft)</Label>
                        <Controller
                          name="length"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.1"
                              placeholder="48"
                              value={
                                field.value === undefined
                                  ? ""
                                  : String(field.value)
                              }
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Label htmlFor="width">Width (ft)</Label>
                        <Controller
                          name="width"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.1"
                              placeholder="8"
                              value={
                                field.value === undefined
                                  ? ""
                                  : String(field.value)
                              }
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height (ft)</Label>
                        <Controller
                          name="height"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.1"
                              placeholder="9"
                              value={
                                field.value === undefined
                                  ? ""
                                  : String(field.value)
                              }
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="pieces">Number of Pieces</Label>
                      <Controller
                        name="pieces"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="e.g., 20"
                            value={
                              field.value === undefined
                                ? ""
                                : String(field.value)
                            }
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            rows={3}
                            placeholder="Describe the cargo..."
                            {...field}
                          />
                        )}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="hazmat"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(v) => field.onChange(Boolean(v))}
                        />
                      )}
                    />
                    <Label>Hazardous Materials</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="temperatureControlled"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(v) => field.onChange(Boolean(v))}
                        />
                      )}
                    />
                    <Label>Temperature Controlled</Label>
                  </div>

                  {watchedTemperatureControlled && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="tempMin">Min Temperature (°F)</Label>
                        <Controller
                          name="tempMin"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              inputMode="decimal"
                              placeholder="35"
                              value={
                                field.value === undefined
                                  ? ""
                                  : String(field.value)
                              }
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tempMax">Max Temperature (°F)</Label>
                        <Controller
                          name="tempMax"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              inputMode="decimal"
                              placeholder="38"
                              value={
                                field.value === undefined
                                  ? ""
                                  : String(field.value)
                              }
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="specialInstructions">
                    Special Instructions
                  </Label>
                  <Controller
                    name="specialInstructions"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        rows={3}
                        placeholder="Any special handling instructions..."
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevTab}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back: Locations
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextTab}
                    disabled={!isTabValid("details")}
                    className="flex items-center gap-2"
                    title={`Validation: Valid=${isTabValid("details")}`}
                  >
                    Next: Schedule
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              </TabsContent>

              {/* Schedule */}
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
                        <Controller
                          name="pickupDate"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="date"
                              min={new Date().toISOString().split("T")[0]}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        {errors.pickupDate && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.pickupDate.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pickupTime">Pickup Time</Label>
                        <Controller
                          name="pickupTime"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="time"
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          )}
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
                        <Controller
                          name="deliveryDate"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="date"
                              min={
                                watchedPickupDate ||
                                new Date().toISOString().split("T")[0]
                              }
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        {errors.deliveryDate && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.deliveryDate.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="deliveryTime">Delivery Time</Label>
                        <Controller
                          name="deliveryTime"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="time"
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <Controller
                    name="referenceNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="Internal reference or PO number"
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevTab}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back: Load Details
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextTab}
                    disabled={!isTabValid("schedule")}
                    className="flex items-center gap-2"
                  >
                    Next: Contacts
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              </TabsContent>

              {/* Contacts */}
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
                        <Label htmlFor="pickupContactName">
                          Contact Name *
                        </Label>
                        <Controller
                          name="pickupContactName"
                          control={control}
                          render={({ field }) => (
                            <Input placeholder="John Doe" {...field} />
                          )}
                        />
                        {errors.pickupContactName && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.pickupContactName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pickupContactPhone">
                          Phone Number *
                        </Label>
                        <Controller
                          name="pickupContactPhone"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="tel"
                              placeholder="(555) 123-4567"
                              {...field}
                            />
                          )}
                        />
                        {errors.pickupContactPhone && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.pickupContactPhone.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pickupContactEmail">Email</Label>
                        <Controller
                          name="pickupContactEmail"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="email"
                              placeholder="john@company.com"
                              {...field}
                            />
                          )}
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
                        <Label htmlFor="deliveryContactName">
                          Contact Name *
                        </Label>
                        <Controller
                          name="deliveryContactName"
                          control={control}
                          render={({ field }) => (
                            <Input placeholder="Jane Smith" {...field} />
                          )}
                        />
                        {errors.deliveryContactName && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.deliveryContactName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="deliveryContactPhone">
                          Phone Number *
                        </Label>
                        <Controller
                          name="deliveryContactPhone"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="tel"
                              placeholder="(555) 987-6543"
                              {...field}
                            />
                          )}
                        />
                        {errors.deliveryContactPhone && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.deliveryContactPhone.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="deliveryContactEmail">Email</Label>
                        <Controller
                          name="deliveryContactEmail"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="email"
                              placeholder="jane@company.com"
                              {...field}
                            />
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="flex justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevTab}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back: Schedule
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting
                      ? mode === "create"
                        ? "Creating..."
                        : "Updating..."
                      : mode === "create"
                      ? "Create Load"
                      : "Update Load"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
