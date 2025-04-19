import React, { useState, useEffect } from 'react';
import { SearchBoxCore, SessionToken } from '@mapbox/search-js-core';

interface MapboxSearchProps {
  language: string;
  onSelectLocation: (location: {
    name: string;
    coordinates: { longitude: number; latitude: number };
    region?: string;
    place?: string;
  }) => void;
  placeholder?: string;
  initialValue?: string;
}

const MapboxSearch: React.FC<MapboxSearchProps> = ({
  language,
  onSelectLocation,
  placeholder,
  initialValue = ''
}) => {
  const [accessToken] = useState<string>('sk.eyJ1IjoiYW1pcmFtZXIiLCJhIjoiY205b2o0YmRjMHB2bDJyc2VsODR2NXlxdCJ9.nlCz0k6PLB9M6IleClJXyQ');
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchBoxCore, setSearchBoxCore] = useState<SearchBoxCore | null>(null);
  const [sessionToken, setSessionToken] = useState<SessionToken | null>(null);
  
  useEffect(() => {
    if (accessToken) {
      const searchBox = new SearchBoxCore({ accessToken });
      const token = new SessionToken();
      setSearchBoxCore(searchBox);
      setSessionToken(token);
    }
  }, [accessToken]);

  const handleSearch = async (query: string) => {
    if (!searchBoxCore || !sessionToken || !query.trim()) {
      console.log('No query or no access token');
      setSuggestions([]);
      return;
    }
    try {
      const response = await searchBoxCore.suggest(query, {
        sessionToken,
        language: language === 'he' ? 'he' : 'en',
        country: 'IL'
      });
      
      setSuggestions(response.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    if (!searchBoxCore || !sessionToken) return;

    try {
      const response = await searchBoxCore.retrieve(suggestion, { sessionToken });
      if (response.features && response.features.length > 0) {
        const feature = response.features[0];
        const { properties, geometry } = feature;
        
        onSelectLocation({
          name: properties.place_formatted || properties.full_address || properties.name,
          coordinates: {
            longitude: geometry.coordinates[0],
            latitude: geometry.coordinates[1]
          },
          region: properties.context?.region?.name,
          place: properties.context?.place?.name
        });
        
        setInputValue(properties.place_formatted || properties.full_address || properties.name);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error retrieving location details:', error);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          console.log('Input value changed:', e.target.value);
          setInputValue(e.target.value);
          handleSearch(e.target.value);
        }}
        onFocus={() => inputValue && handleSearch(inputValue)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder || (language === 'he' ? 'חפש יישוב או כתובת...' : 'Search for a location...')}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        dir={language === 'he' ? 'rtl' : 'ltr'}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectSuggestion(suggestion)}
              dir={language === 'he' ? 'rtl' : 'ltr'}
            >
              <div className="font-medium">{suggestion.name}</div>
              {suggestion.place_formatted && (
                <div className="text-sm text-gray-600">{suggestion.place_formatted}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapboxSearch; 