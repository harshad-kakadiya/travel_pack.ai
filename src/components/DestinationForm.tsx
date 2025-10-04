import React from 'react';
import { Destination } from '../context/TripContext';
import { Plus, Minus, MapPin } from 'lucide-react';

interface DestinationFormProps {
  destinations: Destination[];
  onUpdate: (destinations: Destination[]) => void;
  tripDuration: number;
}

export function DestinationForm({ destinations, onUpdate, tripDuration }: DestinationFormProps) {
  const [suggestionsByIndex, setSuggestionsByIndex] = React.useState<Record<number, { name: string; country?: string }[]>>({});
  const [loadingIndex, setLoadingIndex] = React.useState<number | null>(null);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const debounceRef = React.useRef<number | undefined>(undefined);
  const controllerRef = React.useRef<AbortController | null>(null);

  // Function to validate destination suggestions
  // This prevents incorrect suggestions like "Munichi Peru" from appearing in the dropdown
  const isValidDestination = (item: { name: string; country?: string }): boolean => {
    const name = item.name.toLowerCase();
    const country = item.country?.toLowerCase() || '';
    
    // List of known invalid destinations
    const invalidDestinations = [
      'munichi',
      'municha',
      'municho',
    ];
    
    // Check for Munich in countries where it doesn't exist
    if (name.includes('munich') && (country.includes('peru') || country.includes('grenada'))) {
      return false;
    }
    
    // Check for other invalid city-country combinations
    const invalidCombinations = [
      { city: 'munich', countries: ['peru', 'grenada', 'india'] },
      { city: 'paris', countries: ['peru', 'india'] },
      { city: 'london', countries: ['peru', 'india'] },
    ];
    
    for (const combo of invalidCombinations) {
      if (name.includes(combo.city) && combo.countries.some(c => country.includes(c))) {
        return false;
      }
    }
    
    // Check if the name contains any invalid patterns
    if (invalidDestinations.some(invalid => name.includes(invalid))) {
      return false;
    }
    
    // Check for obviously fake city names (repeated characters, etc.)
    if (/^[a-z]+\1+$/i.test(name)) {
      return false;
    }
    
    // Check for very short names that are likely errors
    if (name.length < 2) {
      return false;
    }
    
    return true;
  };

  const fetchCitySuggestions = async (index: number, query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestionsByIndex((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      setLoadingIndex(index);
      // Cancel any in-flight request before starting a new one
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;

      // Use Open-Meteo Geocoding API as the primary provider
      let items: { name: string; country?: string }[] = [];
      try {
        const resp = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`,
          { signal: controller.signal }
        );
        const data = await resp.json();
        items = (data?.results || []).map((it: any) => ({
          name: it.name,
          country: it.country,
        }));

        // Filter out obviously incorrect suggestions using validation function
        items = items.filter(isValidDestination);

        // If we have no valid results, try a fallback service
        if (items.length === 0) {
          try {
            const fallbackResp = await fetch(
              `https://api.geonames.org/searchJSON?name=${encodeURIComponent(query)}&maxRows=8&username=demo&featureClass=P&featureCode=PPL`,
              { signal: controller.signal }
            );
            const fallbackData = await fallbackResp.json();
            items = (fallbackData?.geonames || []).map((it: any) => ({
              name: it.name,
              country: it.countryName,
            })).filter(isValidDestination);
          } catch (_fallbackErr) {
            // If fallback also fails, keep empty array
          }
        }
      } catch (_err) {
        items = [];
      }

      setSuggestionsByIndex((prev) => ({ ...prev, [index]: items }));
    } catch (e) {
      setSuggestionsByIndex((prev) => ({ ...prev, [index]: [] }));
    } finally {
      setLoadingIndex((curr) => (curr === index ? null : curr));
      controllerRef.current = null;
    }
  };

  const handleCityInputChange = (index: number, value: string) => {
    updateDestination(index, 'cityName', value);
    setOpenIndex(index);
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      fetchCitySuggestions(index, value);
    }, 300);
  };

  const selectSuggestion = (index: number, suggestion: { name: string; country?: string }) => {
    updateDestination(index, 'cityName', suggestion.name);
    // Always auto-fill/overwrite the country when a city is chosen
    if (suggestion.country) {
      updateDestination(index, 'country', suggestion.country);
    }
    setOpenIndex(null);
  };
  const addDestination = () => {
    onUpdate([...destinations, { cityName: '', country: '', daysAllocated: 0 }]);
  };

  const removeDestination = (index: number) => {
    onUpdate(destinations.filter((_, i) => i !== index));
  };

  const updateDestination = (index: number, field: keyof Destination, value: string | number) => {
    const updated = destinations.map((dest, i) => 
      i === index ? { ...dest, [field]: value } : dest
    );
    onUpdate(updated);
  };

  const allocatedDays = destinations.reduce((sum, dest) => sum + dest.daysAllocated, 0);
  const remainingDays = tripDuration - allocatedDays;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Destinations *
        </label>
        {tripDuration > 0 && (
          <div className="text-sm text-gray-600">
            Allocated: {allocatedDays}/{tripDuration} days
            {remainingDays !== 0 && (
              <span className={remainingDays > 0 ? 'text-orange-600' : 'text-red-600'}>
                {' '}({remainingDays > 0 ? '+' : ''}{remainingDays} remaining)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {destinations.map((destination, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 mr-2" />
                Destination {index + 1}
              </div>
              {destinations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDestination(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-1 relative">
                <input
                  type="text"
                  placeholder="City name *"
                  value={destination.cityName}
                  onChange={(e) => handleCityInputChange(index, e.target.value)}
                  onFocus={() => destination.cityName && setOpenIndex(index)}
                  onBlur={() => {
                    // Delay closing slightly to allow click on suggestion
                    window.setTimeout(() => setOpenIndex((curr) => (curr === index ? null : curr)), 100);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {openIndex === index && (
                  <div className="absolute left-0 right-0 mt-1 z-50 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow">
                    {loadingIndex === index && (
                      <div className="p-3 text-sm text-gray-500">Searching…</div>
                    )}
                    {(suggestionsByIndex[index] || []).map((s, i) => (
                      <button
                        key={`${s.name}-${i}`}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-blue-50"
                        onClick={() => selectSuggestion(index, s)}
                      >
                        <span className="text-sm font-medium text-gray-900">{s.name}</span>
                        {s.country && (
                          <span className="ml-2 text-xs text-gray-500">{s.country}</span>
                        )}
                      </button>
                    ))}
                    {(!loadingIndex || loadingIndex !== index) && (suggestionsByIndex[index]?.length ?? 0) === 0 && destination.cityName && destination.cityName.length >= 2 && (
                      <div className="p-3 text-sm text-gray-500">No results</div>
                    )}
                  </div>
                )}
                {/* Spacer to avoid overlapping the date field when dropdown is open */}
                {openIndex === index && (
                  <div className="h-56" />
                )}
              </div>
              <div className="md:col-span-1">
                <input
                  type="text"
                  placeholder="Country (optional)"
                  value={destination.country || ''}
                  onChange={(e) => updateDestination(index, 'country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={tripDuration || 365}
                    placeholder="Days"
                    value={destination.daysAllocated || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        updateDestination(index, 'daysAllocated', 0);
                      } else {
                        const numValue = parseInt(value);
                        updateDestination(index, 'daysAllocated', numValue > 0 ? numValue : 0);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    day{(destination.daysAllocated || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addDestination}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Another Destination
        </button>
      </div>
    </div>
  );
}