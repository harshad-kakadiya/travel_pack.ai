import React from 'react';
import { Persona } from '../context/TripContext';

interface PersonaSelectorProps {
  selected?: Persona;
  onSelect: (persona: Persona) => void;
}

const personas: { value: Persona; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'New Traveler',
    label: 'New Traveler',
    icon: <span className="text-2xl">🧳</span>,
    description: 'First-time or occasional traveler who wants detailed guidance and tips'
  },
  {
    value: 'Experienced Traveler',
    label: 'Experienced Traveler',
    icon: <span className="text-2xl">🌍</span>,
    description: 'Seasoned explorer who prefers advanced tips and efficient information'
  },
  {
    value: 'Solo Female Traveler',
    label: 'Solo Female Traveler',
    icon: <span className="text-2xl">👩‍🦰</span>,
    description: 'Traveling alone with focus on safety, trusted services, and local customs'
  },
  {
    value: 'Minor/Under 18',
    label: 'Minor/Under 18',
    icon: <span className="text-2xl">🧒</span>,
    description: 'Under 18 with special requirements for documentation and safety'
  },
  {
    value: 'Family',
    label: 'Family',
    icon: <span className="text-2xl">👨‍👩‍👧</span>,
    description: 'Traveling with children, focusing on family-friendly activities and logistics'
  }
];

export function PersonaSelector({ selected, onSelect }: PersonaSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-4">
        What type of traveler are you? *
      </label>
      <div className="grid md:grid-cols-2 gap-4">
        {personas.map((persona) => (
          <button
            key={persona.value}
            type="button"
            onClick={() => onSelect(persona.value)}
            className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
              selected === persona.value
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${
                selected === persona.value ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {persona.icon}
              </div>
              <div>
                <h3 className={`font-semibold ${
                  selected === persona.value ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {persona.label}
                </h3>
                <p className={`text-sm mt-1 ${
                  selected === persona.value ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {persona.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}