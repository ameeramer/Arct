import React, { useState, useEffect, useRef } from 'react';

interface GooglePlacesSearchProps {
  language: string;
  onSelectLocation: (location: {
    name: string;
    coordinates: { longitude: number; latitude: number };
    region?: string;
    place?: string;
    place_id?: string;
  }) => void;
  placeholder?: string;
  initialValue?: string;
}

const GooglePlacesSearch: React.FC<GooglePlacesSearchProps> = ({
  language,
  onSelectLocation,
  placeholder,
  initialValue = ''
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // וודא שה-Google Maps API נטען
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return;
    }

    // יצירת אובייקט Autocomplete
    if (inputRef.current) {
      const options: google.maps.places.AutocompleteOptions = {
        componentRestrictions: { country: 'il' }, // מגביל לישראל
      };

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, options);
      console.log('inputRef.current', inputRef.current);
      // Set language correctly
      if (autocompleteRef.current) {
        // Use the correct method to set language
        autocompleteRef.current.setComponentRestrictions({
          country: 'il'
        });
      }

      // האזנה לאירוע בחירת מקום
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          // שמירת הערך שהמשתמש הקליד
          const userInput = inputRef.current?.value || '';
          
          // מציאת שם האזור (מחוז/region)
          let region = '';
          let locality = '';
          
          if (place.address_components) {
            for (const component of place.address_components) {
              if (component.types.includes('administrative_area_level_1')) {
                // Use the original long_name since there's no Hebrew-specific property
                region = component.long_name;
              }
              if (component.types.includes('locality')) {
                locality = component.long_name;
              }
            }
          }
          
          // השתמש בטקסט שהמשתמש הקליד אם השפה היא עברית
          console.log('place', place);
          const locationName = language === 'he' ? userInput : (place.name || '');
          
          onSelectLocation({
            name: locationName,
            coordinates: {
              latitude: lat,
              longitude: lng
            },
            region: region,
            place: language === 'he' ? userInput.split(',')[0] : (locality || place.name || ''),
            place_id: place.place_id
          });
          
          // שמור את הערך המקורי שהמשתמש הקליד
          setInputValue('');
        }
      });
    }
    
    return () => {
      // ניקוי האזנה לאירועים
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [language, onSelectLocation]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder || (language === 'he' ? 'חפש יישוב או כתובת...' : 'Search for a location...')}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        dir={language === 'he' ? 'rtl' : 'ltr'}
      />
    </div>
  );
};

export default GooglePlacesSearch; 