import React from 'react';
import { Destination } from '../context/TripContext';
import { Plus, Minus, MapPin } from 'lucide-react';

interface DestinationFormProps {
  destinations: Destination[];
  onUpdate: (destinations: Destination[]) => void;
  tripDuration: number;
}

export function DestinationForm({ destinations, onUpdate, tripDuration }: DestinationFormProps) {
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
              <div className="md:col-span-1">
                <input
                  type="text"
                  placeholder="City name *"
                  value={destination.cityName}
                  onChange={(e) => updateDestination(index, 'cityName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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