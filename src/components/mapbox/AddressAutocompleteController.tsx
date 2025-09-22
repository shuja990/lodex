'use client';

import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import AddressAutocomplete, { AddressAutocompleteProps } from './AddressAutocomplete';
import { LoadLocation } from '@/types/load';

interface AddressAutocompleteControllerProps<T extends FieldValues> extends Omit<AddressAutocompleteProps, 'value' | 'onChange'> {
  name: Path<T>;
  control: Control<T>;
  rules?: object;
}

export default function AddressAutocompleteController<T extends FieldValues>({
  name,
  control,
  rules,
  ...addressAutocompleteProps
}: AddressAutocompleteControllerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
        <AddressAutocomplete
          {...addressAutocompleteProps}
          value={value as LoadLocation | undefined}
          onChange={(location: LoadLocation | null) => {
            onChange(location);
            onBlur();
          }}
          error={error?.message}
        />
      )}
    />
  );
}