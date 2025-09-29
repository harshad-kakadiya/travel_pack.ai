import React from 'react';

interface ActivityPreferencesProps {
  selected: string[];
  onSelect: (activities: string[]) => void;
}

const activities = [
  {
    id: 'cultural',
    emoji: '🏛️',
    title: 'Cultural Sites',
    description: 'Museums, temples, historical landmarks'
  },
  {
    id: 'adventure',
    emoji: '🏔️',
    title: 'Adventure Sports',
    description: 'Hiking, climbing, extreme sports'
  },
  {
    id: 'food',
    emoji: '🍜',
    title: 'Food & Dining',
    description: 'Local cuisine, food tours, cooking classes'
  },
  {
    id: 'nightlife',
    emoji: '🌃',
    title: 'Nightlife',
    description: 'Bars, clubs, evening entertainment'
  },
  {
    id: 'nature',
    emoji: '🌲',
    title: 'Nature & Parks',
    description: 'National parks, gardens, wildlife'
  },
  {
    id: 'shopping',
    emoji: '🛍️',
    title: 'Shopping',
    description: 'Markets, malls, local crafts'
  },
  {
    id: 'relaxation',
    emoji: '🧘',
    title: 'Relaxation',
    description: 'Spas, beaches, wellness activities'
  },
  {
    id: 'photography',
    emoji: '📸',
    title: 'Photography',
    description: 'Scenic spots, photo opportunities'
  }
];

export function ActivityPreferences({ selected, onSelect }: ActivityPreferencesProps) {
  const toggleActivity = (activityId: string) => {
    if (selected.includes(activityId)) {
      onSelect(selected.filter(id => id !== activityId));
    } else {
      onSelect([...selected, activityId]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-4">
        Activity Preferences (Optional)
      </label>
      <p className="text-sm text-gray-500 mb-4">
        Select the types of activities you're most interested in to help us personalize your recommendations.
      </p>
      
      <div className="grid md:grid-cols-2 gap-4">
        {activities.map((activity) => (
          <button
            key={activity.id}
            type="button"
            onClick={() => toggleActivity(activity.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
              selected.includes(activity.id)
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 text-2xl ${
                selected.includes(activity.id) ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {activity.emoji}
              </div>
              <div>
                <h3 className={`font-semibold ${
                  selected.includes(activity.id) ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {activity.title}
                </h3>
                <p className={`text-sm mt-1 ${
                  selected.includes(activity.id) ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {activity.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {selected.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900 text-sm font-medium">
            Selected: {selected.length} activit{selected.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      )}
    </div>
  );
}