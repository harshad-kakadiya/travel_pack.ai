import React from 'react';
import { Calendar } from 'lucide-react';

interface DateSelectorProps {
  startDate?: string;
  endDate?: string;
  onDateChange: (dates: { startDate?: string; endDate?: string }) => void;
}

export function DateSelector({ startDate, endDate, onDateChange }: DateSelectorProps) {
  const today = new Date().toISOString().split('T')[0];

  const handleStartDateChange = (date: string) => {
    onDateChange({ startDate: date });
    // If end date is before new start date, clear it
    if (endDate && new Date(endDate) < new Date(date)) {
      onDateChange({ startDate: date, endDate: undefined });
    }
  };

  const handleEndDateChange = (date: string) => {
    onDateChange({ endDate: date });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-4">
        Travel Dates *
      </label>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              value={startDate || ''}
              min={today}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent relative z-10"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              value={endDate || ''}
              min={startDate || today}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent relative z-10"
              disabled={!startDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}