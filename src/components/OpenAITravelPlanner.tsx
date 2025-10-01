import React, { useState } from 'react';
import { callOpenAITravelPlanning, validateTripData, formatTripDataForDisplay, TripFormData, PromptType } from '../lib/openaiClient';
import { useTripContext } from '../context/TripContext';
import { Loader2, Send, AlertCircle, CheckCircle, Copy, Download } from 'lucide-react';

interface OpenAITravelPlannerProps {
  onResponse?: (response: string) => void;
}

export function OpenAITravelPlanner({ onResponse }: OpenAITravelPlannerProps) {
  const { tripData } = useTripContext();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [promptType, setPromptType] = useState<PromptType>('travel_brief');
  const [error, setError] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      // Convert trip context data to the format expected by OpenAI function
      const openAITripData: TripFormData = {
        persona: tripData.persona,
        passportCountry: tripData.passportCountry,
        activityPreferences: tripData.activityPreferences,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        destinations: tripData.destinations,
        groupSize: tripData.groupSize,
        ages: tripData.ages,
        budget: tripData.budget,
        bookingData: tripData.parsedBookingData
      };

      const result = await callOpenAITravelPlanning(openAITripData, promptType);

      if (result.success) {
        setResponse(result.response);
        setGeneratedPrompt(result.prompt);
        onResponse?.(result.response);
      } else {
        setError(result.error || 'Failed to generate travel plan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
    }
  };

  const handleCopyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
    }
  };

  const handleDownloadResponse = () => {
    if (response) {
      const blob = new Blob([response], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `travel-plan-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Validate current trip data
  const validation = validateTripData({
    persona: tripData.persona,
    passportCountry: tripData.passportCountry,
    activityPreferences: tripData.activityPreferences,
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    destinations: tripData.destinations,
    groupSize: tripData.groupSize,
    ages: tripData.ages,
    budget: tripData.budget,
    bookingData: tripData.parsedBookingData
  });

  const canGenerate = validation.isValid && !isLoading;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          AI Travel Planning Assistant
        </h2>
        
        {/* Trip Data Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Current Trip Data:</h3>
          <p className="text-sm text-gray-600">
            {formatTripDataForDisplay({
              persona: tripData.persona,
              passportCountry: tripData.passportCountry,
              activityPreferences: tripData.activityPreferences,
              startDate: tripData.startDate,
              endDate: tripData.endDate,
              destinations: tripData.destinations,
              groupSize: tripData.groupSize,
              ages: tripData.ages,
              budget: tripData.budget,
              bookingData: tripData.parsedBookingData
            })}
          </p>
        </div>

        {/* Validation Errors */}
        {!validation.isValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="font-semibold text-red-700">Please fix the following issues:</h3>
            </div>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Prompt Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Planning Type:
          </label>
          <select
            value={promptType}
            onChange={(e) => setPromptType(e.target.value as PromptType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="travel_brief">Comprehensive Travel Brief</option>
            <option value="itinerary">Detailed Itinerary</option>
            <option value="recommendations">Local Recommendations</option>
            <option value="safety">Safety & Emergency Info</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGeneratePlan}
          disabled={!canGenerate}
          className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
            canGenerate
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating Travel Plan...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Generate AI Travel Plan
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {response && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">Travel plan generated successfully!</span>
          </div>
        </div>
      )}

      {/* Generated Prompt Display */}
      {generatedPrompt && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Generated Prompt:</h3>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generatedPrompt}</pre>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">AI Travel Plan Response:</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyResponse}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </button>
                <button
                  onClick={handleDownloadResponse}
                  className="flex items-center text-sm text-green-600 hover:text-green-800"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                {response}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}