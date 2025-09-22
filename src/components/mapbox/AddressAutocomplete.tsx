'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, X, Loader2 } from 'lucide-react';
import { LoadLocation, MapboxFeature } from '@/types/load';
import { mapboxFeatureToLocation } from '@/lib/geolocation';

export interface AddressAutocompleteProps {
  value?: LoadLocation;
  onChange: (location: LoadLocation | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  label?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Enter address...',
  className = '',
  disabled = false,
  error,
  required = false,
  label
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<LoadLocation | undefined>(undefined);

  // Debounced search function
  const searchAddresses = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('Mapbox access token not configured');
      }

      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${accessToken}&country=US&types=address,poi&limit=5`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced search
    timeoutRef.current = setTimeout(() => {
      searchAddresses(newQuery);
    }, 300);
  };

  // Debounced onChange to prevent rapid map updates
  const debouncedOnChange = (location: LoadLocation) => {
    if (onChangeTimeoutRef.current) {
      clearTimeout(onChangeTimeoutRef.current);
    }
    
    onChangeTimeoutRef.current = setTimeout(() => {
      try {
        onChange(location);
      } catch (changeError) {
        console.error('Error in debounced onChange callback:', changeError);
      }
    }, 150); // 150ms debounce
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (feature: MapboxFeature) => {
    try {
      const location = mapboxFeatureToLocation(feature);
      if (location) {
        setQuery(location.address);
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedIndex(-1);
        
        // Use requestAnimationFrame to ensure DOM updates are complete
        // before triggering any map-related operations
        requestAnimationFrame(() => {
          debouncedOnChange(location);
        });
      }
    } catch (error) {
      console.error('Error selecting address:', error);
      // Still update the input field even if there's an error
      setQuery(feature.place_name);
      setShowSuggestions(false);
      setSuggestions([]);
      setSelectedIndex(-1);
      
      // Try to create a basic location object as fallback
      try {
        const [longitude, latitude] = feature.geometry.coordinates;
        const basicLocation = {
          address: feature.place_name,
          city: 'Unknown',
          state: 'Unknown',
          zipCode: '',
          coordinates: { latitude, longitude }
        };
        requestAnimationFrame(() => {
          debouncedOnChange(basicLocation);
        });
      } catch (fallbackError) {
        console.error('Could not create fallback location:', fallbackError);
      }
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    onChange(null);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update query when value prop changes
  useEffect(() => {
    if (value && value !== previousValueRef.current) {
      setQuery(value.address);
      previousValueRef.current = value;
    } else if (!value && previousValueRef.current) {
      setQuery('');
      previousValueRef.current = undefined;
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-4 w-4 text-gray-400" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`pl-10 ${query && !disabled ? 'pr-10' : ''} ${error ? 'border-red-500' : ''}`}
        />
        
        {query && !disabled && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </Button>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto border shadow-lg"
        >
          <CardContent className="p-0">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={`px-4 py-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.place_name}
                    </p>
                    {suggestion.properties.address && (
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.properties.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Selected location display */}
      {value && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {value.city}, {value.state}
                </p>
                <p className="text-xs text-blue-700">
                  {value.coordinates.latitude.toFixed(6)}, {value.coordinates.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-auto p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}