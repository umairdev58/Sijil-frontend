import React, { useState, useEffect, useRef } from 'react';
import { TextField, Autocomplete, TextFieldProps } from '@mui/material';
import apiService from '../services/api';

interface AutocompleteTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  field: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

const AutocompleteTextField: React.FC<AutocompleteTextFieldProps> = ({
  field,
  value,
  onChange,
  debounceMs = 300,
  ...textFieldProps
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Fetch suggestions with debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const response = await apiService.getAutocompleteSuggestions(field);
          if (response.success) {
            // Filter suggestions based on input value
            const filteredSuggestions = response.suggestions.filter((suggestion: string) =>
              suggestion.toLowerCase().includes(inputValue.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
          }
        } catch (error) {
          console.error('Error fetching autocomplete suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, field, debounceMs]);

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    onChange(newInputValue);
  };

  const handleOptionSelect = (event: React.SyntheticEvent, newValue: string | null) => {
    const selectedValue = newValue || '';
    setInputValue(selectedValue);
    onChange(selectedValue);
  };

  return (
    <Autocomplete
      freeSolo
      options={suggestions}
      value={inputValue}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleOptionSelect}
      loading={loading}
      loadingText="Loading suggestions..."
      noOptionsText="No suggestions found"
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          InputProps={{
            ...params.InputProps,
            ...textFieldProps.InputProps,
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option}>
          {option}
        </li>
      )}
      filterOptions={(options) => options} // We handle filtering in the API call
    />
  );
};

export default AutocompleteTextField;
