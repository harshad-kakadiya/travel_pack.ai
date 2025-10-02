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

  const fetchCitySuggestions = async (index: number, query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestionsByIndex((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      setLoadingIndex(index);
      const resp = await fetch(`https://api.teleport.org/api/cities/?search=${encodeURIComponent(query)}&limit=8`);
      const data = await resp.json();
      const items: { name: string; country?: string }[] = (data?._embedded?.["city:search-results"] || []).map((it: any) => {
        const full = it.matching_full_name as string;
        // Example: "Paris, Ile-de-France, France"
        const parts = full.split(',').map((p) => p.trim());
        const name = parts[0] || full;
        const country = parts[parts.length - 1];
        return { name, country };
      });
      setSuggestionsByIndex((prev) => ({ ...prev, [index]: items }));
    } catch (e) {
      setSuggestionsByIndex((prev) => ({ ...prev, [index]: [] }));
    } finally {
      setLoadingIndex((curr) => (curr === index ? null : curr));
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
    }, 250);
  };

  const selectSuggestion = (index: number, suggestion: { name: string; country?: string }) => {
    updateDestination(index, 'cityName', suggestion.name);
    if (suggestion.country && !destinations[index]?.country) {
      updateDestination(index, 'country', suggestion.country);
    }
    setOpenIndex(null);
  };
  const addDestination = () => {
    onUpdate([...destinations, { cityName: '', country: '', daysAllocated: 1 }]);
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
                    value={destination.daysAllocated}
                    onChange={(e) => updateDestination(index, 'daysAllocated', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    day{destination.daysAllocated !== 1 ? 's' : ''}
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